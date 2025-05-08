const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "booking",
            required: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        method: {
            type: String,
            enum: [ "khalti", "paypal"],
            required: true,
        },

        status: {
            type: String,
            enum: ["initiated", "successful", "failed", "cancelled"],
            default: "initiated",
        },

        gatewayReference: {
            type: String, // Store gateway-specific ID (e.g., pidx for Khalti, paymentId for PayPal)
            required: false, // Make this field optional initially
        },

        transactionId: {
            type: String,
        },

        amount: {
            type: Number,
        },

        currency: {
            type: String,
        },

        paidAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Payment = mongoose.model("payment", paymentSchema);
module.exports = Payment;
