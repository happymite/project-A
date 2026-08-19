const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middlewares/middleware.js");
const { signupUser, loginMessage, logoutuser } = require("../controllers/user.js");

router.route("/signup")
.get((req,res)=>{
    res.render("users/signup")
})
.post( wrapAsync(signupUser));



router.route("/login")
.get( (req,res)=>{
    res.render("users/login")
})
.post(
    saveRedirectUrl,
    passport.authenticate("local",{
        failureRedirect: "/login",
        failureFlash: true,
    }),
    loginMessage,
);


router.get("/logout",logoutuser);

module.exports = router;