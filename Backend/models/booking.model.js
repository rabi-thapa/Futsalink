const mongoose = require("mongoose");
const User = require("./user.model");
const bookingSchema = new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      venue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Venue",
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
      startTime: {
        type: String,
        required: true,
      },
      endTime: {
        type: String,
        required: true,
      },
      totalPrice: {
        type: Number,
        required: true,
        default: 0,
      },
      paymentStatus: {
        type: String,
        enum: ["pending", "paid", "cancelled"],
        default: "pending",
      },
    },
    {
      timestamps: true,
    }
  );
  

const Booking = mongoose.model("booking", bookingSchema);
module.exports = Booking;
