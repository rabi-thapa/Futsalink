const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer.middleware");
const verifyToken= require("../middlewares/auth.middleware");


const {
    addVenue,
    updateVenueDetails,
    updateVenueImage,
    deleteVenue,
    getAllVenues, 
    getVenueById,
    getVendorVenues,
    addReview,
    getVenueWithReviews,

    addDiscount,
    updateDiscount,
    deleteDiscount,
    listDiscounts,


    getVenueRevenue

} = require("../controllers/venue.controller");


router.get("/currentVenue/:venueId", verifyToken, getVenueById);

router.get("/myVenues",verifyToken,  getVendorVenues);
router.get("/", getAllVenues);
router.post("/addVenue", verifyToken, upload.single('venueImage'), addVenue);
router.put("/venueDetails/:venueId", verifyToken, updateVenueDetails);
router.put("/venueImage/:venueId", verifyToken, upload.single("venueImage"), updateVenueImage);
router.delete("/deleteVenue/:venueId" , verifyToken, deleteVenue);

router.post('/:venueId/review', verifyToken, addReview);
router.get('/:id', getVenueWithReviews);

router.post("/venues/:venueId/discounts", verifyToken, addDiscount);
router.put("/venues/:venueId/discounts/:discountId", verifyToken, updateDiscount);
router.delete("/venues/:venueId/discounts/:discountId", verifyToken, deleteDiscount);
router.get("/venues/:venueId/discounts", verifyToken, listDiscounts);




router.get('/:venueId/revenue', verifyToken, getVenueRevenue);
module.exports = router;



