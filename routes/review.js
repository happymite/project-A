const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const Review = require('../models/review.js');
const Listing = require('../models/listing');
const { validateReview ,isLoggedIn, isreviewAuthor} = require("../middlewares/middleware.js");
const { Reviewpost,deleteReview } = require("../controllers/review.js");




//review post route
router.post("/", isLoggedIn,validateReview,wrapAsync(Reviewpost));


//delete review route
router.delete("/:reviewId",isLoggedIn,isreviewAuthor,
    wrapAsync(deleteReview),
);


module.exports=router;