const User = require("../models/user.js");

module.exports.signupUser = async(req,res,next)=>{
    try{
 let {username, email, password}=req.body;
    const newUser = new User ({email,username});
    const registeredUser=await User.register(newUser, password );
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", "user was registered");
    res.redirect("./listings");
    })
    
    }catch(e){
        req.flash("error", e.message);
        res.redirect("./signup");
        return next(e);
        
    }
   
};


module.exports.loginMessage= async(req,res)=>{
        req.flash("success", "Welcome back to Vegabond");
        let redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
    };

    module.exports.becomeHost = async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        isHost: true,
        hostSince: Date.now(),
    });
    req.flash("success", "You're now a host! Start listing your property.");
    res.redirect("/listings/new");
};


    module.exports.logoutuser=(req, res,next)=>{
   req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","you are logged out!");
        res.redirect("/listings");
    });
};

