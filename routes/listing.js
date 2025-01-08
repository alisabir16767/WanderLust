const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing");
const Review = require("../models/review");
const { isLoggedIn } = require("../middleware");

// Validation middleware for Listing
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Route index (Show all listings)
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
  })
);

// New route (Render form to create new listing)
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new");
});

// Create route (Create new listing with owner set to logged-in user)
router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; // Set the owner to the logged-in user
    await newListing.save();
    req.flash("success", "New listing created");
    res.redirect("/listings");
  })
);

// Edit route (Check if the logged-in user is the owner)
router.get(
  "/:id/edit",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "The listing you are searching for does not exist!");
      res.redirect("/listings");
    } else if (!listing.owner.equals(req.user._id)) {
      req.flash("error", "You do not have permission to edit this listing.");
      res.redirect("/listings");
    }

    res.render("listings/edit", { listing });
  })
);

// Update route (Only allow the owner to update the listing)
router.put(
  "/:id/set-owner",
  isLoggedIn, // Ensure user is logged in
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    // Set the owner to the logged-in user
    listing.owner = req.user._id;
    await listing.save();

    req.flash("success", "Owner updated for the listing");
    res.redirect(`/listings/${id}`);
  })
);

// Delete route (Only allow the owner to delete the listing)
router.delete(
  "/:id",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing.owner.equals(req.user._id)) {
      req.flash("error", "You do not have permission to delete this listing.");
      return res.redirect("/listings");
    }

    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted");
    res.redirect("/listings");
  })
);

// Show route (Render listing with populated reviews and owner)
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
      .populate("reviews") // Populate reviews
      .populate("owner"); // Populate owner

    if (!listing) {
      req.flash("error", "The listing you requested does not exist!");
      return res.redirect("/listings");
    }
    console.log(listing);

    res.render("listings/show", { listing });
  })
);

module.exports = router;
