const express = require('express');
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require('../schema.js');
const Listing = require("../models/listing"); 
const Review = require("../models/review"); // Ensure correct import

const validateReview = (req, res, next) => {
   const { error } = reviewSchema.validate(req.body);
   if (error) {
      const errMsg = error.details.map(el => el.message).join(", ");
      throw new ExpressError(400, errMsg);
   } else {
      next();
   }
};

// Add review to a listing
router.post('/', validateReview, wrapAsync(async (req, res) => {
   let listing = await Listing.findById(req.params.id);
   if (!listing) {
      throw new ExpressError(404, "Listing not found");
   }
   let newReview = new Review(req.body.review);
   listing.reviews.push(newReview);
   await newReview.save();
   await listing.save();
   console.log("New Review saved");
   req.flash("success","new review created");
   res.redirect(`/listings/${listing.id}`);
}));

// Delete review from a listing
router.delete("/:reviewId", wrapAsync(async (req, res) => {
   const { reviewId } = req.params;
   const listing = await Listing.findOneAndUpdate(
      { 'reviews': reviewId },
      { $pull: { reviews: reviewId } },
      { new: true }
   );
   if (!listing) {
      throw new ExpressError(404, "Listing not found");
   }
   await Review.findByIdAndDelete(reviewId);
   req.flash("success","review is deleted");
   res.redirect(`/listings/${listing.id}`);
}));

module.exports = router;
