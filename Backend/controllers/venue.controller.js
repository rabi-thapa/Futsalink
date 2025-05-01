const Venue = require("../models/venue.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const Review= require("../models/review.model");


// const getVenueById = asyncHandler(async (req, res) => {
//     try {

//         const venueId = req.params.venueId;

//         // console.log("Fetching venue: ", venueId);

//         const venue = await Venue.findById(venueId);
//         if (!venue) {
//             return res.status(404).json({ message: "Venue not found" });
//         }

//         return res.status(200).json({
//             success: true,
//             message: "Venue fetched successfully",
//             venue,
//         });
//     } catch (error) {
//         console.error("Error fetching venue:", error);
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// });


const getVenueById = asyncHandler(async (req, res) => {
  try {
    const venueId = req.params.venueId;

    // Fetch the venue with its reviews populated
    const venue = await Venue.findById(venueId)
      .populate({
        path: 'reviews',
        select: 'rating', // Only fetch the rating field from reviews
      })
      .exec();

    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    // Calculate the average rating
    const reviews = venue.reviews;
    const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRatings / reviews.length).toFixed(1) : null;

    // Add the average rating to the response
    return res.status(200).json({
      success: true,
      message: "Venue fetched successfully",
      venue: {
        ...venue.toObject(),
        averageRating: averageRating || 'N/A', // Include average rating in the response
      },
    });
  } catch (error) {
    console.error("Error fetching venue:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


const getVendorVenues = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const vendorId = req.user._id; 

        // console.log("Vendor ID:", req.user._id);



        // console.log('vendorId', vendorId);
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

const getAllVenues = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, location, search = '', sortBy = 'location', sortOrder = 'asc' } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const query = {};
    if (location && location.trim()) {
      query['location.locationName'] = { $regex: new RegExp(location, 'i') };
    }
    if (search && search.trim()) {
      query.venueName = { $regex: new RegExp(search, 'i') };
    }

    let sortCriteria = {};
    const order = sortOrder === 'desc' ? -1 : 1;
    if (sortBy === 'venueName') sortCriteria.venueName = order;
    else if (sortBy === 'price') sortCriteria.pricePerHour = order;
    else sortCriteria['location.locationName'] = order;

    const venues = await Venue.find(query)
      .sort(sortCriteria)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const totalVenues = await Venue.countDocuments(query);
    return res.status(200).json({
      message: 'All venues retrieved successfully',
      totalVenues,
      totalPages: Math.ceil(totalVenues / limitNumber),
      currentPage: pageNumber,
      venues,
    });
  } catch (error) {
    console.error('Fetching All Venues Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});
  




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


const updateVenueDetails = asyncHandler(async (req, res) => {
    try {
      // console.log("req.body: ", req.body);
  
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
    getVenueWithReviews
};
