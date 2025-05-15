//Backend/controller/dashboard.controller.js


const Booking = require('../models/booking.model');
const Venue = require('../models/venue.model');
const mongoose = require('mongoose');

// Get booking trends aggregated by time granularity (week, month, year)
const getBookingTrends = async (req, res) => {
  try {
    const { granularity = 'month', venueId } = req.query;

    // Determine grouping field based on granularity
    let groupByField;
    switch (granularity) {
      case 'week':
        groupByField = { $week: '$date' };
        break;
      case 'month':
        groupByField = { $month: '$date' };
        break;
      case 'year':
        groupByField = { $year: '$date' };
        break;
      default:
        return res.status(400).json({ message: 'Invalid granularity' });
    }

    // Apply filter if venueId is provided
    const matchStage = venueId ? { venue: mongoose.Types.ObjectId(venueId) } : {};

    // Aggregate booking trends by group field
    const bookingTrends = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupByField,
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    // Return fallback if no data found
    if (bookingTrends.length === 0) {
      return res.status(200).json({
        labels: ['No Data'],
        datasets: [{ data: [0] }],
      });
    }

    // Map grouping field to readable labels
    let labels;
    if (granularity === 'week') {
      labels = bookingTrends.map((trend) => `Week ${trend._id}`);
    } else if (granularity === 'month') {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
      labels = bookingTrends.map((trend) => months[trend._id - 1]);
    } else if (granularity === 'year') {
      labels = bookingTrends.map((trend) => trend._id.toString());
    }

    // Construct response data
    const bookingTrendsData = {
      labels,
      datasets: [{ data: bookingTrends.map((trend) => trend.count) }],
    };

    res.status(200).json(bookingTrendsData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get total revenue aggregated by time granularity
const getRevenueAnalysis = async (req, res) => {
  try {
    const { granularity = 'month', venueId } = req.query;

    // Determine grouping field
    let groupByField;
    switch (granularity) {
      case 'week':
        groupByField = { $week: '$date' };
        break;
      case 'month':
        groupByField = { $month: '$date' };
        break;
      case 'year':
        groupByField = { $year: '$date' };
        break;
      default:
        return res.status(400).json({ message: 'Invalid granularity' });
    }

    const matchStage = venueId ? { venue: mongoose.Types.ObjectId(venueId) } : {};

    // Aggregate revenue considering discount periods
    const revenueAnalysis = await Booking.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'venues',
          localField: 'venue',
          foreignField: '_id',
          as: 'venueDetails',
        },
      },
      { $unwind: '$venueDetails' },
      {
        $addFields: {
          discountedPrice: {
            $cond: {
              if: {
                $and: [
                  { $gt: ['$venueDetails.discount.discountPercentage', 0] },
                  { $gte: ['$date', '$venueDetails.discount.validFrom'] },
                  { $lte: ['$date', '$venueDetails.discount.validUntil'] },
                ],
              },
              then: {
                $multiply: [
                  '$totalPrice',
                  { $subtract: [1, { $divide: ['$venueDetails.discount.discountPercentage', 100] }] },
                ],
              },
              else: '$totalPrice',
            },
          },
        },
      },
      {
        $group: {
          _id: groupByField,
          totalRevenue: { $sum: '$discountedPrice' },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    if (revenueAnalysis.length === 0) {
      return res.status(200).json({
        labels: ['No Data'],
        datasets: [{ data: [0] }],
      });
    }

    // Format labels for frontend
    let labels;
    if (granularity === 'week') {
      labels = revenueAnalysis.map((revenue) => `W ${revenue._id}`);
    } else if (granularity === 'month') {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
      labels = revenueAnalysis.map((revenue) => months[revenue._id - 1]);
    } else {
      labels = revenueAnalysis.map((revenue) => revenue._id.toString());
    }

    const revenueData = {
      labels,
      datasets: [{ data: revenueAnalysis.map((r) => r.totalRevenue) }],
    };

    res.status(200).json(revenueData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get distribution of payment statuses
const getPaymentStatus = async (req, res) => {
  try {
    const paymentStatusCounts = await Booking.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    // Format for frontend pie chart
    const paymentStatusData = paymentStatusCounts.map((status) => ({
      name: status._id.charAt(0).toUpperCase() + status._id.slice(1),
      population: status.count,
      color:
        status._id === 'successful'
          ? '#4CAF50'
          : status._id === 'pending'
          ? '#FFC107'
          : '#F44336',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    }));

    if (paymentStatusData.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(paymentStatusData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get top 5 most booked venues
const getVenuePopularity = async (req, res) => {
  try {
    const venuePopularityData = await Booking.aggregate([
      { $group: { _id: "$venue", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "venues",
          localField: "_id",
          foreignField: "_id",
          as: "venueDetails",
        },
      },
      { $unwind: "$venueDetails" },
      {
        $project: {
          venueName: "$venueDetails.venueName",
          venueId: "$venueDetails._id",
          count: 1,
        },
      },
    ]);

    const chartData = {
      labels: venuePopularityData.map((item) => item.venueName),
      datasets: [{ data: venuePopularityData.map((item) => item.count) }],
      venueIds: venuePopularityData.map((item) => item.venueId.toString()),
    };

    res.status(200).json(chartData);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get booking frequency by start time across all venues
const getAllVenuePeakHours = async (req, res) => {
  try {
    const peakHours = await Booking.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: "$startTime",
          totalBookings: { $sum: 1 },
        },
      },
      { $sort: { totalBookings: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: peakHours.map(item => ({
        hour: item._id,
        bookings: item.totalBookings,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get bookings for a specific hour with venue and user details
const getBookingsByHour = async (req, res) => {
  try {
    const { startTime } = req.query;

    if (!startTime) {
      return res.status(400).json({ message: "startTime is required" });
    }

    const bookings = await Booking.find({
      startTime,
      paymentStatus: "paid",
    })
      .populate("venue", "venueName")
      .populate("user", "fullName")
      .exec();

    res.status(200).json({
      success: true,
      hour: startTime,
      bookings: bookings.map(b => ({
        id: b._id,
        venueName: b.venue?.venueName || "Unknown Venue",
        user: b.user?.fullName || "Anonymous",
        date: b.date,
        duration: `${b.startTime} - ${b.endTime}`,
        price: b.totalPrice,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getBookingTrends,
  getRevenueAnalysis,
  getPaymentStatus,
  getVenuePopularity,
  getAllVenuePeakHours,
  getBookingsByHour,
};
