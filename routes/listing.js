const express = require("express");
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require("../models/listing");
const {isLoggedIn, isOwner, isHost, validateListing} = require("../middlewares/middleware.js");


const  listingController = require("../controllers/listing.js");
const { storage } = require("../cloudconfig.js");
const upload = require("../middlewares/uploads");  // or the correct path





router.route("/")
.get(wrapAsync(listingController.index))
.post(
    isLoggedIn,
    isHost,
    upload.single('image'), validateListing,
    wrapAsync(listingController.CreateListing)
);

router.get("/new", isLoggedIn, isHost,
    listingController.renderNewForm);

router.get("/:id/edit", isLoggedIn, isHost, isOwner, wrapAsync(listingController.EditListing));

router.route("/:id")
.get(wrapAsync(listingController.ShowListing))
.put(isLoggedIn,
    isHost,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing))
.delete(isLoggedIn,
    isHost,
    isOwner,
    wrapAsync(listingController.deleteListing)
);

module.exports = router;