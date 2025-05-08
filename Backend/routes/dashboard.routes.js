// routes/dashboard.route.js
const express = require('express');
const router = express.Router();
const { getBookingTrends,getRevenueAnalysis, getPaymentStatus, getVenuePopularity,getAllVenuePeakHours, getBookingsByHour  } = require('../controllers/dashboard.controller')
const verifyToken = require('../middlewares/auth.middleware');

router.get('/booking-trends', verifyToken, getBookingTrends);
router.get('/revenue-analysis', verifyToken, getRevenueAnalysis);
router.get('/payment-status', verifyToken, getPaymentStatus);
router.get('/venue-popularity', verifyToken, getVenuePopularity);


router.get('/peak-hours', verifyToken, getAllVenuePeakHours);
router.get("/peak-hour-bookings", verifyToken, getBookingsByHour);

module.exports = router;