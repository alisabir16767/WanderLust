const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
require("dotenv").config();

const MONGO_URL = process.env.MONGO_URL;

main()
  .then(() => {
    console.log("Connected to DB");
    return initDB();
  })
  .catch((err) => {
    console.error(
      "Connection to DB failed. Please check your .env file or database settings.",
      err
    );
  });

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
  } catch (error) {
    console.error("Error while connecting to MongoDB:", error);
    throw error;
  }
}

const initDB = async () => {
  try {
    // Clear the Listing collection
    await Listing.deleteMany({});
    console.log("Existing listings deleted");

    // Map the data and apply the owner ObjectId
    const preparedData = initData.data.map((obj) => ({
      ...obj,
      owner: new mongoose.Types.ObjectId("677de6314301fb676714c81a"),
    }));

    console.log("Prepared data:", preparedData);

    // Insert the prepared data into the database
    await Listing.insertMany(preparedData);
    console.log("Data was initialized");
  } catch (error) {
    console.error("Error initializing data:", error);
  }
};
