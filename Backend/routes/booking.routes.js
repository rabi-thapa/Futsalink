const express= require("express");
const router= express.Router();

const verifyToken = require("../middlewares/auth.middleware");

const {createBooking, getUserBookings, getVendorOrders, getBookedSlots,  cancelBooking}= require("../controllers/booking.controller")

router.post("/", verifyToken, createBooking);
router.get("/my-bookings", verifyToken, getUserBookings);
router.get("/vendor-orders", verifyToken, getVendorOrders); 
router.get("/booked-slots", verifyToken, getBookedSlots);

router.post("/cancel", verifyToken, cancelBooking);



module.exports= router;
