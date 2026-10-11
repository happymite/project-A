const crypto = require("crypto");
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");
const { isListingAvailable } = require("../utils/bookingAvailability.js");
const {
  parseIndiaCalendarDate,
  todayInIndia,
  todayInputValue,
  numberOfNights,
} = require("../utils/bookingDates.js");

const GST_RATE = 0.18;
const MAX_REFERENCE_ATTEMPTS = 3;

function newBookingReference() {
  return `VB-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

function bookingFormUrl(listingId) {
  return `/listings/${listingId}/book`;
}

function rejectBooking(req, res, message) {
  req.flash("error", message);
  return res.redirect(bookingFormUrl(req.params.id));
}

function validateBookingInput(body) {
  const checkIn = parseIndiaCalendarDate(body.checkIn);
  const checkOut = parseIndiaCalendarDate(body.checkOut);
  const guestCount = Number(body.guestCount);

  if (!checkIn || !checkOut) return { error: "Choose valid check-in and check-out dates." };
  if (checkIn < todayInIndia()) return { error: "Check-in cannot be in the past." };
  if (checkOut <= checkIn) return { error: "Check-out must be after check-in." };
  if (!Number.isInteger(guestCount) || guestCount < 1) {
    return { error: "Guest count must be a whole number of at least 1." };
  }

  return { checkIn, checkOut, guestCount };
}

module.exports.renderBookingForm = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    req.flash("error", "Listing you requested does not exist.");
    return res.redirect("/listings");
  }

  if (listing.owner && listing.owner.equals(req.user._id)) {
    req.flash("error", "You cannot book your own listing.");
    return res.redirect(`/listings/${listing._id}`);
  }

  res.render("bookings/new.ejs", { listing, today: todayInputValue() });
};

module.exports.createBooking = async (req, res) => {
  const input = validateBookingInput(req.body);
  if (input.error) return rejectBooking(req, res, input.error);

  let createdBooking;
  let lastError;

  // A reference collision is extremely unlikely, but a unique index is only
  // useful if we handle it instead of showing the guest a database error.
  for (let attempt = 0; attempt < MAX_REFERENCE_ATTEMPTS; attempt += 1) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const listing = await Listing.findById(req.params.id).session(session);
        if (!listing) throw new Error("LISTING_NOT_FOUND");
        if (listing.owner && listing.owner.equals(req.user._id)) {
          throw new Error("OWN_LISTING");
        }
        if (input.guestCount > listing.maxGuests) throw new Error("CAPACITY_EXCEEDED");

        const available = await isListingAvailable({
          listingId: listing._id,
          checkIn: input.checkIn,
          checkOut: input.checkOut,
          session,
        });
        if (!available) throw new Error("DATES_UNAVAILABLE");

        // This shared write prevents two overlap checks from silently passing
        // at the same time under MongoDB snapshot isolation.
        await Listing.updateOne(
          { _id: listing._id },
          { $inc: { bookingLockVersion: 1 } },
          { session }
        );

        const nights = numberOfNights(input.checkIn, input.checkOut);
        const subtotal = Number((listing.price * nights).toFixed(2));
        const taxes = Number((subtotal * GST_RATE).toFixed(2));
        const totalPrice = Number((subtotal + taxes).toFixed(2));
        const [booking] = await Booking.create(
          [{
            bookingReference: newBookingReference(),
            listing: listing._id,
            guest: req.user._id,
            host: listing.owner,
            checkIn: input.checkIn,
            checkOut: input.checkOut,
            guestCount: input.guestCount,
            pricePerNight: listing.price,
            numOfNights: nights,
            subtotal,
            taxes,
            totalPrice,
          }],
          { session }
        );
        createdBooking = booking;
      });
      break;
    } catch (error) {
      lastError = error;
      if (error.message === "LISTING_NOT_FOUND") return rejectBooking(req, res, "Listing you requested does not exist.");
      if (error.message === "OWN_LISTING") return rejectBooking(req, res, "You cannot book your own listing.");
      if (error.message === "CAPACITY_EXCEEDED") return rejectBooking(req, res, "Guest count exceeds this listing's capacity.");
      if (error.message === "DATES_UNAVAILABLE") return rejectBooking(req, res, "Those dates are no longer available.");
      if (error.code !== 11000 || attempt === MAX_REFERENCE_ATTEMPTS - 1) throw error;
    } finally {
      await session.endSession();
    }
  }

  if (!createdBooking) throw lastError;
  req.flash("success", `Booking ${createdBooking.bookingReference} is pending confirmation.`);
  res.redirect(`/listings/${req.params.id}`);
};
