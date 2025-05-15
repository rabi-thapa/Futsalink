//Backend/controller/review.controller.js



// Import async handler for handling async errors in Express routes
const asyncHandler = require("../utils/asyncHandler");

// Import Review and Venue models
const Review = require("../models/review.model");
const Venue = require("../models/venue.model");

/**
 * @desc    Add a new review to a venue
 * @route   POST /api/reviews/:venueId
 * @access  Private (Authenticated users only)
 */
const addReview = asyncHandler(async (req, res) => {
    console.log("add review backend func");

    // Destructure rating and comment from request body
    const { rating, comment } = req.body;

    // Get venue ID from route parameters
    const venueId = req.params.venueId;

    console.log("body", req.body);
    console.log("venueId", venueId);

    // Validate rating value
    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    // Find venue by ID
    const venue = await Venue.findById(venueId);
    if (!venue) return res.status(404).json({ message: "Venue not found" });

    // Create and save the new review
    const review = await Review.create({
        user: req.user._id, // Logged-in user ID
        rating,
        comment,
    });

    // Add review ID to venue's reviews array
    venue.reviews.push(review._id);

    // Recalculate venue's average rating
    const allReviews = await Review.find({ _id: { $in: venue.reviews } });
    const totalRating = allReviews.reduce((acc, r) => acc + r.rating, 0);
    
    // Fix typo: "lenght" to "length"
    venue.averageRating = totalRating / allReviews.length;

    // Save updated venue with new average rating
    await venue.save();

    // Send success response with the new review
    res.status(201).json({ message: "Review added successfully", review });
});

/**
 * @desc    Update an existing review
 * @route   PUT /api/reviews/:reviewId
 * @access  Private (Only the user who created the review)
 */
const updateReview = asyncHandler(async (req, res) => {
    // Find review by ID
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Check if the logged-in user is the author of the review
    if (review.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized" });
    }

    // Update review fields (fallback to current values if not provided)
    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;

    // Save updated review
    await review.save();

    // Send success response
    res.json({ message: "Review updated successfully" });
});

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:reviewId
 * @access  Private (Only the user who created the review)
 */
const deleteReview = asyncHandler(async (req, res) => {
    console.log("delete review backend function triggered");

    // Extract review ID and current user ID
    const reviewId = req.params.reviewId;
    const userId = req.user._id;

    // Find review by ID
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Check if the review belongs to the logged-in user
    if (!review.user.equals(userId)) {
        return res.status(403).json({ message: "Unauthorized to delete this review" });
    }

    // Remove review reference from all venues that contain it
    await Venue.updateMany(
        { reviews: reviewId },
        { $pull: { reviews: reviewId } }
    );

    // Delete the review document
    await review.deleteOne();

    // Send success response
    res.json({ message: "Review deleted successfully" });
});

// Export all review-related controllers
module.exports = {
    addReview,
    updateReview,
    deleteReview,
};
