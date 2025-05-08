// controllers/dashboard.controller.js
const Booking = require('../models/booking.model');
const Venue = require('../models/venue.model');

// Booking Trends (Monthly Aggregation)
const getBookingTrends = async (req, res) => {
  try {
      const { granularity = 'month', venueId } = req.query; // Default granularity is 'month'

      let groupByField;
      switch (granularity) {
          case 'week':
              groupByField = { $week: '$date' }; // Group by week
              break;
          case 'month':
              groupByField = { $month: '$date' }; // Group by month
              break;
          case 'year':
              groupByField = { $year: '$date' }; // Group by year
              break;
          default:
              return res.status(400).json({ message: 'Invalid granularity' });
      }

      const matchStage = venueId ? { venue: mongoose.Types.ObjectId(venueId) } : {};

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

      if (bookingTrends.length === 0) {
          return res.status(200).json({
              labels: ['No Data'],
              datasets: [{ data: [0] }],
          });
      }

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

      const bookingTrendsData = {
          labels,
          datasets: [
              {
                  data: bookingTrends.map((trend) => trend.count),
              },
          ],
      };

      res.status(200).json(bookingTrendsData);
  } catch (error) {
      console.error('Error fetching booking trends:', error);
      res.status(500).json({ message: 'Server error' });
  }
};


// Revenue Analysis (Monthly Aggregation)


const getRevenueAnalysis = async (req, res) => {
  try {
      const { granularity = 'month', venueId } = req.query; // Default granularity is 'month'

      let groupByField;
      switch (granularity) {
          case 'week':
              groupByField = { $week: '$date' }; // Group by week
              break;
          case 'month':
              groupByField = { $month: '$date' }; // Group by month
              break;
          case 'year':
              groupByField = { $year: '$date' }; // Group by year
              break;
          default:
              return res.status(400).json({ message: 'Invalid granularity' });
      }

      const matchStage = venueId ? { venue: mongoose.Types.ObjectId(venueId) } : {};

      const revenueAnalysis = await Booking.aggregate([
          { $match: matchStage }, // Filter by venue if provided
          {
              $lookup: {
                  from: 'venues', // Join with the Venue collection
                  localField: 'venue',
                  foreignField: '_id',
                  as: 'venueDetails',
              },
          },
          { $unwind: '$venueDetails' }, // Unwind the joined venue details
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
                  totalRevenue: { $sum: '$discountedPrice' }, // Sum discounted or original price
              },
          },
          { $sort: { '_id': 1 } }, // Sort by the grouped field
      ]);

      if (revenueAnalysis.length === 0) {
          return res.status(200).json({
              labels: ['No Data'],
              datasets: [{ data: [0] }],
          });
      }

      let labels;
      if (granularity === 'week') {
          labels = revenueAnalysis.map((revenue) => `W ${revenue._id}`);
      } else if (granularity === 'month') {
          const months = [
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December',
          ];
          labels = revenueAnalysis.map((revenue) => months[revenue._id - 1]);
      } else if (granularity === 'year') {
          labels = revenueAnalysis.map((revenue) => revenue._id.toString());
      }

      const revenueData = {
          labels,
          datasets: [
              {
                  data: revenueAnalysis.map((revenue) => revenue.totalRevenue),
              },
          ],
      };

      res.status(200).json(revenueData);
  } catch (error) {
      console.error('Error fetching revenue analysis:', error);
      res.status(500).json({ message: 'Server error' });
  }
};



// Payment Status Distribution
const getPaymentStatus = async (req, res) => {
  try {
    const paymentStatusCounts = await Booking.aggregate([
      {
        $group: {
          _id: '$paymentStatus', // Group by payment status
          count: { $sum: 1 }, // Count bookings per status
        },
      },
    ]);  

    // Map data to a standardized format
    const paymentStatusData = paymentStatusCounts.map((status) => ({
      name: status._id.charAt(0).toUpperCase() + status._id.slice(1), // Capitalize first letter
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

    // Fallback: Return empty data if no records exist
    if (paymentStatusData.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(paymentStatusData);
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};







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
      console.error("Error fetching venue popularity:", error);
      res.status(500).json({ message: "Server error" });
    }
  };


  const getAllVenuePeakHours =async (req, res) => {
    try {
        const peakHours = await Booking.aggregate([
          {
            $match: { paymentStatus: "paid" }
          },
          {
            $group: {
              _id: "$startTime",
              totalBookings: { $sum: 1 }
            }
          },
          { $sort: { totalBookings: -1 } }
        ]);

        console.log("peak hours", peakHours)
    
        res.status(200).json({
          success: true,
          data: peakHours.map(item => ({
            hour: item._id,
            bookings: item.totalBookings
          }))
        });
      } catch (error) {
        console.error("Error fetching peak hours for all venues:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
  };


  const getBookingsByHour =async (req, res) => {
    try {
      const { startTime } = req.query;
  
      if (!startTime) {
        return res.status(400).json({ message: "startTime is required" });
      }
  
      const bookings = await Booking.find({
        startTime,
        paymentStatus: "paid"
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
          price: b.totalPrice
        }))
      });
  
    } catch (error) {
      console.error("Error fetching bookings by hour:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  
 


  
 




module.exports = {
  getBookingTrends,
  getRevenueAnalysis,
  getPaymentStatus,
  getVenuePopularity,

  getAllVenuePeakHours,
  getBookingsByHour
};
