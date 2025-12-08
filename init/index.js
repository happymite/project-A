const mongoose = require('mongoose');
const initData=require('./data.js');
const Listing = require("../models/listing.js");


main()
.then(()=>{
    console.log("Connected to MongoDB");
}).catch((err)=>{
    console.log(err);
});

async function main(){
    
await mongoose.connect("mongodb://127.0.0.1:27017/vegabond");
};






const initDB=async()=>{
   await Listing.deleteMany({});
  initData.data= initData.data.map((obj)=>({...obj,owner:"690b7e875f7f1bd1bc10f4b5"}));
   await Listing.insertMany(initData.data);
   console.log ("Database Initialized");
};

initDB();