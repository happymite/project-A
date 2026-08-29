
if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
};

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const session=require('express-session');
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");



const reviewsRouter = require("./routes/review.js");
const listingsRouter=require("./routes/listing.js");
const userRouter= require("./routes/user.js");

app.engine('ejs', ejsMate); 

app.use(methodOverride('_method')); 





app.set('view engine','ejs');



app.set('views', path.join(__dirname,"views"));  



app.use(express.urlencoded({extended: true})); 
app.use(express.json());
app.use(express.static(path.join(__dirname,'public'))); 

const dbUrl = process.env.ATLAS_URL;
 
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
  touchAfter: 24 * 60 * 60,
});
const sessionOptions = {
    store: store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
       expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxAge : 7 * 24 * 60 * 60 * 1000,
    },
};





app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {

    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;


    next();
});

main()
.then(()=>{
    console.log("Connected to MongoDB");
}).catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(dbUrl);
}


app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);

app.use((req,res,next) => {
    next(new ExpressError(404,"PAGE NOT FOUND !!"))
});

app.use((err, req, res, next) => {
    let {statusCode=500, message="Something Went Wrong !!"}= err;
    if(!err.message){
        err.message = message;
    }
    res.status(statusCode).render("error.ejs",{err});
});

const port = process.env.PORT || 9080;
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});