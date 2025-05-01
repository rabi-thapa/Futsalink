const express= require("express");
const router= express.Router();

const verifyToken = require("../middlewares/auth.middleware");

const {
    addReview,
    updateReview,
    deleteReview,
}= require("../controllers/review.controller");


router.post("/:venueId", verifyToken, addReview);
router.put("/:reviewId", verifyToken, updateReview);
router.delete("/:reviewId", verifyToken, deleteReview);

module.exports= router;