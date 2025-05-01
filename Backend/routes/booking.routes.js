const express= require("express");
const router= express.Router();

const verifyToken = require("../middlewares/auth.middleware");

const {createBooking, getUserBookings, getVendorOrders, getBookedSlots}= require("../controllers/booking.controller")

router.post("/", verifyToken, createBooking);
router.get("/my-bookings", verifyToken, getUserBookings);
router.get("/vendor-orders", verifyToken, getVendorOrders); 
router.get("/booked-slots", verifyToken, getBookedSlots);



module.exports= router;
