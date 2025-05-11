const asyncHandler = require("../utils/asyncHandler");
const Review = require("../models/review.model");
const Venue = require("../models/venue.model");

const addReview = asyncHandler(async (req, res) => {

    console.log("add review backend func")
    const { rating, comment } = req.body;
    const venueId = req.params.venueId;

    console.log("body", req.body);
    console.log("venueId", venueId);

     // Validate rating
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5." });
  }

    const venue = await Venue.findById(venueId);

    if (!venue) return res.status(404).json({ message: "Venue not found" });

    const review = await Review.create({
        user: req.user._id,
        rating,
        comment,
    });

    venue.reviews.push(review._id);

    const allReviews = await Review.find({ _id: { $in: venue.reviews } });
    const totalRating = allReviews.reduce((acc, r) => acc + r.rating, 0);
    venue.averageRating = totalRating / allReviews.lenght;

    await venue.save();

    res.status(201).json({ message: "Review Rating", review });
});

const updateReview = asyncHandler(async (req, res) => {
   

    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized" });
    }

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;
    await review.save();

    res.json({ message: "Review updated successfully" });
});

const deleteReview = asyncHandler(async (req, res) => {
    console.log("delete review backend function triggered");
    const reviewId = req.params.reviewId;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);

    if (!review) return res.status(404).json({ message: "Review not found" });

    if (!review.user.equals(userId)) {
        return res
            .status(403)
            .json({ message: "Unauthorized to delete this review" });
    }

    await Venue.updateMany(
        { reviews: reviewId },
        { $pull: { reviews: reviewId } }
    );
    await review.deleteOne();

    res.json({ message: "Review delted successfully" });
});

module.exports = {
    addReview,
    updateReview,
    deleteReview,
};
