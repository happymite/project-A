const Listing = require("../models/listing");
const {listingSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");


module.exports.index= async (req,res)=>{
  const { q = "", category = "" } = req.query;
  const query = {};
  if (q.trim()) {
    const pattern = new RegExp(q.trim(), "i");
    query.$or = [{ title: pattern }, { location: pattern }, { country: pattern }, { description: pattern }];
  }
  if (category) query.category = category;
  const alllistings = await Listing.find(query).sort({ _id: -1 });
  res.render("listings/index.ejs", { alllistings, q, category });
};

// module.exports.generateDraft = async (req, res) => {
//   const { title = "", location = "", country = "", vibe = "" } = req.body;
//   if (!process.env.OPENAI_API_KEY) {
//     return res.status(503).json({ error: "AI is not configured yet. Add OPENAI_API_KEY to your environment and restart the server." });
//   }
//   const prompt = `Write a warm, specific short vacation-rental description (90-120 words). Avoid hype and invented claims. Property title: ${title}. Location: ${location}, ${country}. Desired feel: ${vibe || "welcoming and memorable"}. Return only the description.`;
//   const response = await fetch("https://api.openai.com/v1/responses", {
//     method: "POST",
//     headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
//     body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4.1-mini", input: prompt })
//   });
//   const data = await response.json();
//   if (!response.ok) throw new ExpressError(response.status, data.error?.message || "Could not create AI copy");
//   res.json({ description: data.output_text?.trim() || "" });
// };




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

module.exports.CreateListing = async (req, res) => {
let result = listingSchema.validate(req.body);
if(result.error){
    throw new ExpressError(400 ,result.error.details.map(el => el.message).join(", "));
};
        if (!req.file) {
            throw new ExpressError(400, "Please add a cover image for your listing.");
        }
       let { path: url, filename } = req.file;
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


module.exports.index = async (req, res) => {
    const { category, sort } = req.query;
    const filter = {};
    // Category filter
    if (category && category !== "all") {
        filter.category = category;
    }
    // Sorting
    let sortOption = {};
    if (sort === "priceAsc") {
        sortOption.price = 1;
    } else if (sort === "priceDesc") {
        sortOption.price = -1;
    } else if (sort === "newest") {
        sortOption.createdAt = -1;
    }
    // Fetch listings
    const alllistings = await Listing
        .find(filter)
        .sort(sortOption);
    // Render page
    res.render("listings/index.ejs", {
        alllistings,
        currentCategory: category || "all",
        sort: sort || "newest"
    });
};