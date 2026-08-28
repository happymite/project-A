const Listing = require("../models/listing");
const {listingSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");


module.exports.index= async (req,res)=>{
  const alllistings =  await Listing.find({});
  res.render("listings/index.ejs",{alllistings});
};




module.exports.renderNewForm = (req,res)=>{
   
    res.render("listings/new.ejs");
};


module.exports.ShowListing = async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id)
    .populate({path:"reviews",
        populate:{
            path:"author",
        },
    }).populate("owner");;
    if(!listing){
        req.flash("error","Listing you requested does not exist" );
        return res.redirect("/listings");
    };
    console.log(listing);
    res.render("listings/show.ejs",{listing});
};



module.exports.CreateListing = async (req, res, next) => {
let result = listingSchema.validate(req.body);
console.log(result);
if(result.error){
    throw new ExpressError(400 ,result.error.details.map(el => el.message).join(", "));
};
if (!req.file) {
            throw new ExpressError(400, "Please add a cover image for your listing.");
        }
        let url = req.file.path;
        let filename = req.file.filename;
        const newListing = new Listing(req.body);
        newListing.owner = req.user._id;
        newListing.image = {url,filename};
        await newListing.save();
        req.flash("success","new listing created" );
        res.redirect("/listings");
    };


    module.exports.EditListing = async (req,res)=>{
        let {id}=req.params;
        const listing=await Listing.findById(id);
         if(!listing){
            req.flash("error","Listing you requested does not exist" );
            return res.redirect("/listings");
        };
        let originalImageurl=listing.image.url;
      originalImageurl =  originalImageurl.replace('/upload/', '/upload/w_300,h_250,c_fill/');
        res.render("listings/edit.ejs",{listing, originalImageurl});
    };


    module.exports.updateListing = async (req,res)=>{
       if(!req.body){
    throw new ExpressError(400, "INVALID DATA!! send valid data for listing")
   }
    let {id}=req.params;
   let listing = await Listing.findByIdAndUpdate(id,{...req.body}, {new: true, runValidators: true});

    if(!listing){
        req.flash("error","Listing you requested does not exist" );
        return res.redirect("/listings");
    }

    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename};
        await listing.save();
    }
    req.flash("success","Listing updated" );
    res.redirect(`/listings/${id}`);
};


module.exports.deleteListing = async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","listing deleted" );
    res.redirect("/listings");
};