const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middlewares/middleware.js");
const bookingController = require("../controllers/booking.js");

router.get("/listings/:id/book", isLoggedIn, wrapAsync(bookingController.renderBookingForm));
router.post("/listings/:id/book", isLoggedIn, wrapAsync(bookingController.createBooking));

module.exports = router;
