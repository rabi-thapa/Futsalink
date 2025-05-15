//Backend/controller/booking.controller.js

// Import models
// const { sendBookingConfirmationEmail } = require("../utils/nodemailer");

const Venue = require("../models/venue.model"); // Register the Venue model
const Booking = require("../models/booking.model");
const Payment = require("../models/booking.model");
const User = require("../models/user.model");

const asyncHandler = require("../utils/asyncHandler");

const createBooking = asyncHandler(async (req, res) => {
    try {
        const { venue, date, startTime, endTime } = req.body; // Expecting `venue` from the frontend
        const user = req.user._id;

        // Ensure required fields are present
        if (!venue || !date || !startTime || !endTime) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate and parse date
        const parsedDate = new Date(date);
        if (isNaN(parsedDate)) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        // Fetch venue details
        const venueDetails = await Venue.findById(venue);
        if (!venueDetails) {
            return res.status(404).json({ message: "Venue not found" });
        }

        const existingBooking = await Booking.findOne({
            venue: venue,
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

        // Calculate total hours and base price
        const hoursBooked =
            (new Date(`1970-01-01T${endTime}`) -
                new Date(`1970-01-01T${startTime}`)) /
            (1000 * 60 * 60);
        let totalPrice = venueDetails.pricePerHour * hoursBooked;

        // Apply discount if valid
        let discountedPrice = null;
        if (venueDetails.discount) {
            const { discountPercentage, validFrom, validUntil } =
                venueDetails.discount;
            const currentDate = new Date();
            if (
                currentDate >= new Date(validFrom) &&
                currentDate <= new Date(validUntil)
            ) {
                discountedPrice =
                    totalPrice - (totalPrice * discountPercentage) / 100;
                discountedPrice = parseFloat(discountedPrice.toFixed(2)); // Round to 2 decimal places
            }
        }

        // Use discounted price if available, otherwise use original price
        const finalPrice = discountedPrice || totalPrice;

        // Create and save the booking
        const booking = new Booking({
            user,
            venue: venueDetails._id,
            date: parsedDate,
            startTime,
            endTime,
            status: "pending",
            paymentStatus: "pending",
            totalPrice: finalPrice,
        });

        const savedBooking = await booking.save();

        res.status(201).json(savedBooking);
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ message: "Server error" });
    }
});

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

// Get all venue IDs for the vendor
const getVendorOrders = asyncHandler(async (req, res) => {
    const vendorId = req.user._id;

    // Get all venue IDs for the vendor
    const venues = await Venue.find({ vendorId: vendorId }).select("_id");
    const venueIds = venues.map((v) => v._id);

    // Find bookings associated with vendor's venues
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

    // Attach payment and duration info to each booking
    const enrichedBookings = await Promise.all(
        bookings.map(async (booking) => {
            const payment = await Payment.findOne({
                booking: booking._id,
            }).select("method status amount currency paidAt");

            const start = new Date(`1970-01-01T${booking.startTime}:00`);
            const end = new Date(`1970-01-01T${booking.endTime}:00`);
            const durationInMilliseconds = end - start;
            const durationInHours = durationInMilliseconds / (1000 * 60 * 60);

            return {
                ...booking.toObject(),
                paymentDetails: payment || null,
                durationInHours: durationInHours.toFixed(2),
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

        // Fetch booked time slots for venue and date
        const bookedSlots = await Booking.find(
            { venue, date },
            { startTime: 1, endTime: 1, _id: 0 } // Only return start and end times
        );

        // Format response to include only start and end times
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

const cancelBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.body;

    // Validate booking ID
    if (!bookingId) {
        return res.status(400).json({ message: "Booking ID is required" });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
    }

    // Check if already canceled
    if (booking.paymentStatus === "cancelled") {
        return res.status(400).json({ message: "Booking already canceled" });
    }

    // Update booking status to 'cancelled'
    booking.paymentStatus = "cancelled";
    await booking.save();

    // Update associated payment status if exists
    await Payment.findOneAndUpdate(
        { booking: bookingId },
        { status: "cancelled" }
    );

    res.status(200).json({
        message: "Booking canceled successfully",
        booking,
    });
});

// Export all booking controller functions

module.exports = {
    createBooking,
    getUserBookings,
    getVendorOrders,
    getBookedSlots,
    cancelBooking,
};
