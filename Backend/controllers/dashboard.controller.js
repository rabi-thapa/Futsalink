// controllers/dashboard.controller.js
const Booking = require('../models/booking.model');
const Venue = require('../models/venue.model');

// Booking Trends (Monthly Aggregation)


const getBookingTrends = async (req, res) => {
  try {
      const { granularity = 'month', venueId } = req.query; // Default granularity is 'month'

      let groupByField;
      switch (granularity) {
          case 'day':
              groupByField = { $dayOfYear: '$date' }; // Group by day of the year
              break;
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
          { $match: matchStage }, // Filter by venue if provided
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
      if (granularity === 'day') {
          labels = bookingTrends.map((trend) => `Day ${trend._id}`);
      } else if (granularity === 'week') {
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


// const getBookingTrends = async (req, res) => {
//     try {
//       const bookingTrends = await Booking.aggregate([
//         {
//           $group: {
//             _id: { $month: '$date' },
//             count: { $sum: 1 }, 
//           },
//         },
//         { $sort: { '_id': 1 } }, 
//       ]);

//       console.log('Booking Trends Aggregation Result:', bookingTrends); 

  
//       if (bookingTrends.length === 0) {
//         console.warn('No booking trends data found.');
//         return res.status(200).json({
//           labels: ['No Data'],
//           datasets: [{ data: [0] }],
//         });
//       }
  
//       const months = [
//         'January', 'February', 'March', 'April', 'May', 'June',
//         'July', 'August', 'September', 'October', 'November', 'December',
//       ];
  
//       const bookingTrendsData = {
//         labels: bookingTrends.map((trend) => months[trend._id - 1]),
//         datasets: [
//           {
//             data: bookingTrends.map((trend) => trend.count),
//           },
//         ],
//       };
//       console.log('Formatted Booking Trends Data:', bookingTrendsData); 
//       res.status(200).json(bookingTrendsData);
//     } catch (error) {
//       console.error('Error fetching booking trends:', error);
//       res.status(500).json({ message: 'Server error' });
//     }
//   };



// Revenue Analysis (Monthly Aggregation)
const getRevenueAnalysis = async (req, res) => {
  try {
    const revenueAnalysis = await Booking.aggregate([
      {
        $group: {
          _id: { $month: '$date' }, // Group by month
          totalRevenue: { $sum: '$totalPrice' }, // Sum total price per month
        },
      },
      { $sort: { '_id': 1 } }, // Sort by month
    ]);

    const revenueData = {
      labels: revenueAnalysis.length > 0 
        ? revenueAnalysis.map((revenue) => `Month ${revenue._id}`)
        : ['No Data'],
      datasets: [
        {
          data: revenueAnalysis.length > 0 
            ? revenueAnalysis.map((revenue) => revenue.totalRevenue)
            : [0],
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




// Venue Popularity (Average Ratings)
// Venue Popularity (Top Venues by Bookings)
// Venue Popularity (Top Venues by Bookings)
const getVenuePopularity = async (req, res) => {
  try {
    const venuePopularityData = await Booking.aggregate([
      {
        $group: {
          _id: '$venue', // Group by venue ID
          count: { $sum: 1 }, // Count bookings per venue
        },
      },
      { $sort: { count: -1 } }, // Sort by booking count (descending)
      { $limit: 5 }, // Limit to top 5 venues
      {
        $lookup: {
          from: 'venues', // Join with Venue collection
          localField: '_id',
          foreignField: '_id',
          as: 'venueDetails',
        },
      },
      { $unwind: '$venueDetails' }, // Flatten the array
      {
        $project: {
          venueName: '$venueDetails.venueName',
          count: 1,
        },
      },
    ]);

    // Fallback: Return empty data if no records exist
    if (venuePopularityData.length === 0) {
      return res.status(200).json({
        labels: ['No Data'],
        datasets: [{ data: [0] }],
      });
    }

    const venuePopularityChartData = {
      labels: venuePopularityData.map((data) => data.venueName),
      datasets: [
        {
          data: venuePopularityData.map((data) => data.count),
        },
      ],
    };

    res.status(200).json(venuePopularityChartData);
  } catch (error) {
    console.error('Error fetching venue popularity data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
module.exports = {
  getBookingTrends,
  getRevenueAnalysis,
  getPaymentStatus,
  getVenuePopularity

};
