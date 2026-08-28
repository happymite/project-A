if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const dbUrl = process.env.ATLAS_URL || "mongodb://127.0.0.1:27017/vegabond";
const shouldReset = process.argv.includes("--reset");

async function initDB() {
  await mongoose.connect(dbUrl);

  const existingCount = await Listing.countDocuments();
  if (existingCount > 0 && !shouldReset) {
    console.log("Database already contains listings. Run `node init/index.js --reset` to replace them.");
    return;
  }

  if (shouldReset) {
    await Listing.deleteMany({});
  }

  const owner = await User.findOne();
  const listings = initData.data.map((listing) => ({
    ...listing,
    ...(owner ? { owner: owner._id } : {}),
  }));
  await Listing.insertMany(listings);
  console.log(`Database initialized with ${listings.length} listings.`);
}

initDB()
  .catch((error) => {
    console.error("Database initialization failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
