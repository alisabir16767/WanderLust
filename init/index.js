const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("Connected to DB");
    initDB();
  })
  .catch((err) => {
    console.error("Connection to DB failed:", err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  try {
    await Listing.deleteMany({}); // Delete existing listings
    await Listing.insertMany(initData.data); // Insert new listings
    console.log("Data was initialized");
  } catch (error) {
    console.error("Error initializing data:", error);
  }
};
