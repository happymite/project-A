const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middlewares/middleware.js");
const { signupUser, loginMessage, logoutuser, becomeHost } = require("../controllers/user.js");
console.log("becomeHost is:", typeof becomeHost); // add this line
const { isLoggedIn } = require("../middlewares/middleware.js");



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


router.route("/become-host")
.get(isLoggedIn, (req,res)=>{
    res.render("users/become-host");
})
.post(isLoggedIn, wrapAsync(becomeHost));



router.get("/logout",logoutuser);

module.exports = router;
