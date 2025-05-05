const mongoose = require("mongoose");

const venueSchema = new mongoose.Schema(
    {
        venueName: {
            type: String,
            required: true,
        },

        location: {
            locationName: {
                type: String,
                required: true,
            },
            latitude: {
                type: Number,
            },
            longitude: {
                type: Number,
            },
        },

        description: {
            type: String,
        },

        pricePerHour: {
            type: Number,
            required: true,
            default: 0,
        },

        type: {
            type: String,
            default: "indoor",
            enum: ["indoor", "outdoor"],
        },

        reviews: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Review",
            },
        ],

        openingHours: {
            open: {
                type: String,
                required: true,
                match: /^([01]\d|2[0-3]):([0-5]\d)$/,
            },
            close: {
                type: String,
                required: true,
                match: /^([01]\d|2[0-3]):([0-5]\d)$/,
            },
        },

        status: {
            type: Number,
            enum: [1, 0, -1],
            default: 1,
        },

        venueImage: {
            type: String,
        },

        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        discount: {
            discountPercentage: {
                type: Number,
                required: true,
                min: 0,
                max: 100,
            },

            validFrom: {
                type: Date,
                required: true,
            },
            validUntil: {
                type: Date,
                required: true,
            },

            description: {
                type: String,
            },
        },
    },

    { timestamps: true }
);

const Venue = mongoose.model("Venue", venueSchema);
module.exports = Venue;
