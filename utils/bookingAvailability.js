const Booking = require("../models/booking.js");

// The checkout date is exclusive. A stored booking ending on the requested
// check-in date is therefore not an overlap.
async function isListingAvailable({ listingId, checkIn, checkOut, session }) {
  const query = Booking.exists({
    listing: listingId,
    status: { $in: ["pending", "confirmed"] },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  });

  if (session) query.session(session);
  const blockingBooking = await query;
  return !blockingBooking;
}

module.exports = { isListingAvailable };


