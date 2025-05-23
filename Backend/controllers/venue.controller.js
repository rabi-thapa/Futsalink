//Backend/controller/venue.controller.js


// Importing required models and utilities
const Venue = require("../models/venue.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const Review= require("../models/review.model");
const Booking= require("../models/booking.model");
const Payment= require("../models/payment.model")

const mongoose = require("mongoose");


// Utility function to calculate discounted price
const calculateDiscountedPrice = (price, discount) => {
  if (!discount || !discount.discountPercentage) return null;
  const currentDate = new Date();
  if (
    currentDate >= new Date(discount.validFrom) &&
    currentDate <= new Date(discount.validUntil)
  ) {
    const discountedPrice = price - (price * discount.discountPercentage) / 100;
    return discountedPrice.toFixed(2); // Round to 2 decimal places
  }
  return null;
};





// Get a single venue by ID, including average rating and discount
const getVenueById = asyncHandler(async (req, res) => {
  try {
    const venueId = req.params.venueId;
    const venue = await Venue.findById(venueId)
      .populate({
        path: 'reviews',
        select: 'rating',
      })
      .exec();
    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }
    // Calculate the average rating
    const reviews = venue.reviews;
    const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRatings / reviews.length).toFixed(1) : null;

    // Calculate discounted price if a valid discount exists
    let discountedPrice = null;
    if (venue.discount) {
      const { discountPercentage, validFrom, validUntil } = venue.discount;
      const currentDate = new Date();
      if (
        currentDate >= new Date(validFrom) &&
        currentDate <= new Date(validUntil)
      ) {
        discountedPrice = venue.pricePerHour - (venue.pricePerHour * discountPercentage) / 100;
        discountedPrice = parseFloat(discountedPrice.toFixed(2)); // Round to 2 decimal places
      }
    }


    return res.status(200).json({
      success: true,
      message: "Venue fetched successfully",
      venue: {
        ...venue.toObject(),
        averageRating: averageRating || 'N/A',
        discountedPrice: discountedPrice || null, 
      },
    });
  } catch (error) {
    console.error("Error fetching venue:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get all venues added by a specific vendor
const getVendorVenues = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const vendorId = req.user._id; 




        if (!vendorId) {
            return res.status(400).json({ message: "Vendor ID is required" });
        }

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        const venues = await Venue.find({ vendorId })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        const totalVenues = await Venue.countDocuments({ vendorId });

        return res.status(200).json({
            message: "Vendor venues retrieved successfully",
            totalVenues,
            totalPages: Math.ceil(totalVenues / limitNumber),
            currentPage: pageNumber,
            venues,
        });
    } catch (error) {
        console.error("Fetching Vendor Venues Error: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});




  
// Get all venues with optional filters and sorting
const getAllVenues = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, location, search = '', sortBy = 'location', sortOrder = 'asc', discounted } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const query = {};

    // Location filter
    if (location && location.trim()) {
      query['location.locationName'] = { $regex: new RegExp(location, 'i') };
    }

    // Name search filter
    if (search && search.trim()) {
      query.venueName = { $regex: new RegExp(search, 'i') };
    }

    // Filter discounted venues (current active ones)
    if (discounted === 'true') {
      const now = new Date();
      query['discount.discountPercentage'] = { $gt: 0 };
      query['discount.validFrom'] = { $lte: now };
      query['discount.validUntil'] = { $gte: now };
    }

     // Sorting
    let sortCriteria = {};
    const order = sortOrder === 'desc' ? -1 : 1;
    if (sortBy === 'venueName') sortCriteria.venueName = order;
    else if (sortBy === 'price') sortCriteria.pricePerHour = order;
    else sortCriteria['location.locationName'] = order;

     // Fetch filtered venues
    const venues = await Venue.find(query)
      .sort(sortCriteria)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

     // Compute discounted price for each venue
    const venuesWithDiscounts = venues.map((venue) => {
      const discountedPrice = calculateDiscountedPrice(
        venue.pricePerHour,
        venue.discount
      );
      return {
        ...venue.toObject(),
        discountedPrice: discountedPrice || null,
      };
    });

   
    

    const totalVenues = await Venue.countDocuments(query);
    return res.status(200).json({
      message: 'All venues retrieved successfully',
      totalVenues,
      totalPages: Math.ceil(totalVenues / limitNumber),
      currentPage: pageNumber,
      venues: venuesWithDiscounts,
    });
  } catch (error) {
    console.error('Fetching All Venues Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});



// Add a new venue
  const addVenue = asyncHandler(async (req, res) => {
    const { venueName, location, pricePerHour, openingHours } = req.body;

    if (!venueName || !location || !pricePerHour || !openingHours?.open || !openingHours?.close) {
        throw new ApiError(400, "All fields are required");
    }

    const vendorId = req.user._id;

    const existedVenue = await Venue.findOne({ venueName, location, vendorId });

    if (existedVenue) {
        throw new ApiError(400, "You already have a venue with this name at this location");
    }

    const venueImagePath = req.file ? `uploads/venues/${req.file.filename}` : "";

    const venue = await Venue.create({
        venueName,
        location: {
            locationName: location, 
        },
       
        pricePerHour,
        openingHours: {
            open: openingHours.open,
            close: openingHours.close,
        },
        venueImage: venueImagePath,
        vendorId,
    });

    return res.status(201).json({
        message: "Venue registered successfully",
        venueId: venue._id,
    });
});



// Update the image of a venue
const updateVenueImage = asyncHandler(async (req, res) => {
    // console.log("Request received", req.file, req.body);

    if (!req.file) {
        console.log("No file received");
        throw new ApiError(400, "Venue Image is missing");
    }

    const venueId = req.params.venueId; // Extract venueId from request params
    if (!venueId) {
        throw new ApiError(400, "Venue ID is missing");
    }

    const venueImagePath = `uploads/venues/${req.file.filename}`;

    const venue = await Venue.findByIdAndUpdate(
        venueId, 
        { $set: { venueImage: venueImagePath } },
        { new: true }
    );

    if (!venue) {
        throw new ApiError(404, "Venue not found");
    }

    return res.status(200).json({
        statusCode: 200,
        success: true,
        venue, // Fix variable name from `user` to `venue`
        message: "Venue Image is updated successfully",
    });
});

// Update venue details like name, price, status, etc.
const updateVenueDetails = asyncHandler(async (req, res) => {
    try {
      console.log("req.body: ", req.body);
  
      const { venueName, location, description, pricePerHour, type, openingHours, status } = req.body;
  
     
      if (
        !venueName ||
        !location?.locationName ||
        !pricePerHour ||
        !openingHours?.open ||
        !openingHours?.close ||
        status === undefined
      ) {
        throw new ApiError(400, "All fields are required");
      }
  
     
      const venue = await Venue.findByIdAndUpdate(
        req.params.venueId,
        {
          $set: {
            venueName,
            location: {
              locationName: location.locationName,
              latitude: location.latitude,
              longitude: location.longitude,
            },
            description,
            pricePerHour,
            type,
            openingHours: {
              open: openingHours.open, 
              close: openingHours.close,
            },
            status,
          },
        },
        {
          new: true, 
          runValidators: true, 
        }
      );
  
      if (!venue) {
        throw new ApiError(404, "Venue not found");
      }
  
      return res.status(200).json({
        message: "Venue updated successfully",
        venue,
      });
    } catch (error) {
      console.error("Updating Venue Error: ", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });



const deleteVenue = asyncHandler(async (req, res) => {
    try {
        const { venueId } = req.params;
        const vendorId = req.user._id; // Extract vendorId from the authenticated user

        if (!venueId) {
            throw new ApiError(400, "Venue ID is required");
        }

        // Find and delete the venue in one step
        const venue = await Venue.findOneAndDelete({ _id: venueId, vendorId });

        if (!venue) {
            throw new ApiError(404, "Venue not found or you do not have permission to delete it");
        }

        return res.status(200).json({ message: "Venue deleted successfully" });
    } catch (error) {
        console.error("Deleting Venue Error: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


const addReview = asyncHandler(async (req, res) => {
  console.log("Add review api function triggered");

  const venueId = req.params.venueId;
  const { rating, comment } = req.body;

  const venue = await Venue.findById(venueId);
  if (!venue) {
    return res.status(404).json({ message: 'Venue not found' });
  }

  // Step 1: Create and save the review
  const newReview = new Review({
    user: req.user._id,
    rating: Number(rating),
    comment,
  });

  await newReview.save();

  // Step 2: Push review ID into venue's reviews array
  venue.reviews.push(newReview._id);

  // Step 3: Optionally recalculate average rating
  const allReviews = await Review.find({ _id: { $in: venue.reviews } });
  const total = allReviews.reduce((acc, curr) => acc + curr.rating, 0);
  venue.averageRating = total / allReviews.length;

  await venue.save();

  res.status(201).json({ message: 'Review added successfully', review: newReview });
});

const getVenueWithReviews = asyncHandler(async (req, res) => {
  const venueId = req.params.id;

  const venue = await Venue.findById(venueId)
    .populate({
      path: 'reviews',
      populate: {
        path: 'user',
        select: 'firstName lastName profileImage',
      },
    });

  if (!venue) {
    return res.status(404).json({ message: 'Venue not found' });
  }

  res.json(venue);
});



const addDiscount = asyncHandler(async (req, res) => {
  try {
    const { venueId } = req.params;
    const { discountPercentage, validFrom, validUntil, description } = req.body;

    // Validate input
    if (!discountPercentage || !validFrom || !validUntil) {
      return res.status(400).json({
        success: false,
        message: "All fields (discountPercentage, validFrom, validUntil) are required.",
      });
    }

    // Find the venue
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: "Venue not found.",
      });
    }

    // Update or create the discount
    venue.discount = {
      discountPercentage,
      validFrom,
      validUntil,
      description,
    };

    // Save the updated venue
    await venue.save();

    return res.status(201).json({
      success: true,
      message: "Discount added/updated successfully.",
      venue,
    });
  } catch (error) {
    console.error("Error adding/updating discount:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

const updateDiscount = asyncHandler(async (req, res) => {
  try {
    const { venueId, discountId } = req.params;
    const { discountPercentage, validFrom, validUntil, description } = req.body;

    // Find the venue
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: "Venue not found.",
      });
    }

    // Ensure venue has a discounts array
    if (!venue.discounts || venue.discounts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No discounts found for this venue.",
      });
    }

    // Find the specific discount in the venue's discounts array
    const discountIndex = venue.discounts.findIndex(
      (discount) => discount._id.toString() === discountId
    );

    if (discountIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Discount not found.",
      });
    }

    // Update the discount
    venue.discounts[discountIndex] = {
      ...venue.discounts[discountIndex].toObject(),
      discountPercentage: discountPercentage || venue.discounts[discountIndex].discountPercentage,
      validFrom: validFrom || venue.discounts[discountIndex].validFrom,
      validUntil: validUntil || venue.discounts[discountIndex].validUntil,
      description: description || venue.discounts[discountIndex].description,
    };

    // Save the updated venue
    await venue.save();

    return res.status(200).json({
      success: true,
      message: "Discount updated successfully.",
      venue,
    });
  } catch (error) {
    console.error("Error updating discount:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});


const deleteDiscount = asyncHandler(async (req, res) => {
  try {
    const { venueId } = req.params;

    // Find the venue
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: "Venue not found.",
      });
    }

    // Remove the discount
    venue.discount = null;

    // Save the updated venue
    await venue.save();

    return res.status(200).json({
      success: true,
      message: "Discount deleted successfully.",
      venue,
    });
  } catch (error) {
    console.error("Error deleting discount:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

const listDiscounts = asyncHandler(async (req, res) => {
  try {
    const { venueId } = req.params;

    // Find the venue
    const venue = await Venue.findById(venueId).select("discount");
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: "Venue not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Discount retrieved successfully.",
      discount: venue.discount || null,
    });
  } catch (error) {
    console.error("Error listing discount:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});










const getVenueRevenue = async (req, res) => {
  try {
    const venueId = req.params.venueId;

    // 1. Find the venue by ID
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ success: false, message: "Venue not found" });
    }

    // 2. Get all bookings for the venue
    const bookings = await Booking.find({ venue: venueId });

    // 3. Calculate total revenue using 'totalPrice'
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

    // 4. Booking count
    const bookingCount = bookings.length;

    // 5. Calculate average revenue per booking
    const averageRevenuePerBooking = bookingCount === 0 ? 0 : totalRevenue / bookingCount;

    // 6. Send response in correct structure
    return res.json({
      success: true,
      data: {
        venueName: venue.venueName,
        totalRevenue,
        bookingCount,
        averageRevenuePerBooking,
      },
    });

  } catch (error) {
    console.error("Error in getVenueRevenue:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};



module.exports = {
    getVenueById,
    getVendorVenues,
    getAllVenues,
    addVenue,
    updateVenueDetails,
    updateVenueImage,
    deleteVenue,
    addReview,
    getVendorVenues,
    getVenueWithReviews,


    addDiscount,
    updateDiscount,
    deleteDiscount,
    listDiscounts,


    getVenueRevenue
};
