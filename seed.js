const mongoose = require("mongoose");
const Listing = require("./models/listing");
const Review = require("./models/review");
const User = require("./models/user");
require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB...");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB:", err);
  });

// Seed Data
const seedDB = async () => {
  // Delete all existing listings, reviews, and users
  await Listing.deleteMany({});
  await Review.deleteMany({});
  await User.deleteMany({});

  // Create a new user
  const user = new User({ email: "testuser@example.com" });
  await User.register(user, "password123");

  // Create a few reviews
  const review1 = new Review({
    comment: "Great place to stay!",
    rating: 5,
  });
  await review1.save();

  const review2 = new Review({
    comment: "Not bad, but could be cleaner.",
    rating: 3,
  });
  await review2.save();

  // Create a new listing
  const listing = new Listing({
    title: "Beautiful Beachfront Villa",
    description: "A lovely villa by the beach, perfect for a relaxing getaway.",
    image: "https://example.com/beach-villa.jpg",
    price: 250,
    location: "Malibu, CA",
    country: "USA",
    reviews: [review1._id, review2._id], // Add the reviews to the listing
  });

  await listing.save();

  // Log success
  console.log("Data Seeded!");
};

// Run the seeding function
seedDB().then(() => {
  mongoose.connection.close();
});
