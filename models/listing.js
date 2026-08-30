const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const listingSchema = new Schema({
  title: String,
  description: String,
  image: {
    url: String,
    filename: String,
  },
  price: Number,
  location: String,
  country: String,
  category: {
    type: String,
    default: "other",
    enum: ["mountains", "beach", "city", "desert", "forest", "countryside", "island", "lake", "river"],
  },
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: "Review",
  }],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
}, { timestamps: true });

listingSchema.post("findOneAndDelete", async(listing)=>{
  await Review.deleteMany({_id:  {$in:listing.reviews}});
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;  

