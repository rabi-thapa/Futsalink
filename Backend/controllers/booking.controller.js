const Venue = require("../models/venue.model"); // Register the Venue model
const Booking = require("../models/booking.model");
const Payment = require("../models/booking.model");
const User = require("../models/user.model");

const asyncHandler = require("../utils/asyncHandler");

const createBooking = asyncHandler(async (req, res) => {
  try {
    const { venue, date, startTime, endTime } = req.body; // Expecting `venue` from the frontend
    const user = req.user._id;

    console.log('Received venue:', venue); // Debugging log

    // Validate required fields
    if (!venue || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Parse date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Fetch venue details using the `venue` field (assuming it contains the venue ID)
    const venueDetails = await Venue.findById(venue); // Use `venue` directly as the venue ID
    if (!venueDetails) {
      return res.status(404).json({ message: "Venue not found" });
    }

    // Check if booking already exists for the same time slot
    const existingBooking = await Booking.findOne({
      venue: venue, // Use `venue` directly as the venue ID
      date: parsedDate,
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        },
      ],
    });

    if (existingBooking) {
      return res.status(400).json({
        message:
          "Booking not available for this time slot. Please choose another time.",
      });
    }

    // Calculate original price
    const hoursBooked =
      (new Date(`1970-01-01T${endTime}`) - new Date(`1970-01-01T${startTime}`)) /
      (1000 * 60 * 60);
    let totalPrice = venueDetails.pricePerHour * hoursBooked;

    // Check if a valid discount exists
    let discountedPrice = null;
    if (venueDetails.discount) {
      const { discountPercentage, validFrom, validUntil } = venueDetails.discount;
      const currentDate = new Date();
      if (
        currentDate >= new Date(validFrom) &&
        currentDate <= new Date(validUntil)
      ) {
        discountedPrice = totalPrice - (totalPrice * discountPercentage) / 100;
        discountedPrice = parseFloat(discountedPrice.toFixed(2)); // Round to 2 decimal places
      }
    }

    // Use discounted price if available, otherwise use original price
    const finalPrice = discountedPrice || totalPrice;

    // Create a new booking
    const booking = new Booking({
      user,
      venue: venueDetails._id, // Save the venue ID in the database
      date: parsedDate,
      startTime,
      endTime,
      status: "pending",
      paymentStatus: "pending",
      totalPrice: finalPrice, // Save the final price
    });

    const savedBooking = await booking.save();

    // Respond with the booking details
    res.status(201).json(savedBooking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// const createBooking = asyncHandler(async (req, res) => {
//     try {
//         const { venue, date, startTime, endTime } = req.body;
//         const user = req.user._id;

//         console.log("req.body", req.body);

//         if (!venue || !date || !startTime || !endTime || !user) {
//             return res.status(400).json({ message: "All fields are required" });
//         }

//         // Convert date string to Date object
//         const parsedDate = new Date(date);
//         if (isNaN(parsedDate)) {
//             return res.status(400).json({ message: "Invalid date format" });
//         }

//         const venueDetails = await Venue.findById(venue);
//         if (!venueDetails) {
//             return res.status(404).json({ message: "Venue not found" });
//         }

//         // Convert start and end times to Date objects for comparison
//         const start = new Date(`1970-01-01T${startTime}:00`);
//         const end = new Date(`1970-01-01T${endTime}:00`);

//         // Validate time range
//         const durationInMilliseconds = end - start;
//         const durationInHours = durationInMilliseconds / (1000 * 60 * 60);
//         if (durationInHours <= 0) {
//             return res.status(400).json({ message: "Invalid time range" });
//         }

//         // Calculate total price based on duration
//         const totalPrice = (venueDetails.pricePerHour || 0) * durationInHours;

//         // Check for overlapping bookings
//         const existingBooking = await Booking.findOne({
//             venue: venue,
//             date: date,
//             $or: [
//                 {
//                     startTime: { $lt: endTime },
//                     endTime: { $gt: startTime },
//                 },
//             ],
//         });

//         if (existingBooking) {
//             return res.status(400).json({
//                 message:
//                     "Booking not available for this time slot. Please choose another time.",
//             });
//         }

//         // Create a new booking
//         const booking = new Booking({
//             user,
//             venue,
//             date: parsedDate,
//             startTime,
//             endTime,
//             status: "pending",
//             paymentStatus: "pending",
//             totalPrice,
//         });

//         console.log("booking made: ", booking);

//         const savedBooking = await booking.save();
//         res.status(201).json(savedBooking);
//     } catch (error) {
//         console.error("Error creating booking", error);
//         res.status(500).json({ message: "Server error" });
//     }
// });

const getUserBookings = asyncHandler(async (req, res) => {
    const user = req.user._id;

    const bookings = await Booking.find({ user })
        .populate("venue", "venueName location pricePerHour venueImage")
        .sort({ createdAt: -1 });

    if (!bookings || bookings.length === 0) {
        return res.status(200).json({
            message: "No bookings found for this user",
            bookings: [],
        });
    }

    res.status(200).json({
        message: "Bookings retrieved successfully",
        bookings,
    });
});

const getVendorOrders = asyncHandler(async (req, res) => {
    const vendorId = req.user._id;

    // Fetch all venues owned by the vendor
    const venues = await Venue.find({ vendorId: vendorId }).select("_id");
    const venueIds = venues.map((v) => v._id);

    // Fetch all bookings for the vendor's venues
    const bookings = await Booking.find({ venue: { $in: venueIds } })
        .populate({
            path: "user",
            select: "firstName email profileImage",
        })
        .populate({
            path: "venue",
            select: "venueName location pricePerHour venueImage",
        })
        .sort({ createdAt: -1 });

    // Fetch payment details for each booking
    const enrichedBookings = await Promise.all(
        bookings.map(async (booking) => {
            const payment = await Payment.findOne({
                booking: booking._id,
            }).select("method status amount currency paidAt");

            // Calculate booking duration
            const start = new Date(`1970-01-01T${booking.startTime}:00`);
            const end = new Date(`1970-01-01T${booking.endTime}:00`);
            const durationInMilliseconds = end - start;
            const durationInHours = durationInMilliseconds / (1000 * 60 * 60);

            return {
                ...booking.toObject(),
                paymentDetails: payment || null,
                durationInHours: durationInHours.toFixed(2), // Add duration in hours
            };
        })
    );

    res.status(200).json({
        message: "Vendor orders fetched successfully",
        bookings: enrichedBookings,
    });
});

const getBookedSlots = asyncHandler(async (req, res) => {
    try {
        const { venue, date } = req.query;

        // Validate required fields
        if (!venue || !date) {
            return res
                .status(400)
                .json({ message: "Venue ID and date are required" });
        }

        // Fetch booked slots for the given venue and date
        const bookedSlots = await Booking.find(
            { venue, date },
            { startTime: 1, endTime: 1, _id: 0 } // Only return start and end times
        );

        // Format the response
        const formattedBookedSlots = bookedSlots.map((slot) => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
        }));

        res.status(200).json({
            message: "Booked slots fetched successfully",
            bookedSlots: formattedBookedSlots,
        });
    } catch (error) {
        console.error("Error fetching booked slots:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = {
    createBooking,
    getUserBookings,
    getVendorOrders,
    getBookedSlots,
};
