const express = require("express");
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require("../models/listing");
const {listingSchema} = require("../schema.js");
const {isLoggedIn,isOwner,validateListing}=require("../middlewares/middleware.js");


const  listingController = require("../controllers/listing.js");
const multer= require('multer');
const upload = require("../middlewares/uploads");  // or the correct path







router.route("/")
// index route 
.get(wrapAsync(listingController.index))
// create route
.post(
    isLoggedIn,
   upload.single('image'), validateListing,
    wrapAsync(listingController.CreateListing)
);


//new route
router.get("/new",isLoggedIn,
    listingController.renderNewForm);
//edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.EditListing));



router.route("/:id")
// show route
.get( wrapAsync(listingController.ShowListing))
//update route
.put(isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
     wrapAsync(listingController.updateListing))
//delete route
.delete(isLoggedIn,
    isOwner,
    wrapAsync(listingController.deleteListing)
);

module.exports=router;