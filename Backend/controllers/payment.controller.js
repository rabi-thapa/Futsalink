// Backend/controller/payment.controller.js

// Import required modules and libraries
const path = require("path");
const axios = require("axios"); // For making HTTP requests
const paypal = require("paypal-rest-sdk"); // PayPal SDK for payments

// Import database models
const Payment = require("../models/payment.model");
const Booking = require("../models/booking.model");
const User = require("../models/user.model");

const { sendBookingConfirmationEmail } = require("../utils/nodemailer");

// Configure PayPal SDK with sandbox credentials
paypal.configure({
    mode: "sandbox", // Use sandbox for testing
    client_id:
        "AUrwEoUMqCYvg4L3Hbj6B9zagPlSF6z_axTcgwbzQZ_PcvxLcWQXpXPBc0ct7FB5LR4OtAClElmKSn_7",
    client_secret:
        "EEnr8nnNnSU7n_JD9ZwGq7tH3G_xxM1NCCJLdgQ3vb74_dTaKnO1Pd3gJJYdXyhvW9KshUoDHiHu3agw",
});

// Controller to initiate payment using Khalti
const initiateKhaltiPayment = async (req, res) => {
    const { bookingId } = req.body;

    try {
        console.log("Initiating Khalti payment process...");

        // Ensure bookingId is provided
        if (!bookingId) {
            console.error("Error: Missing bookingId in request body");
            return res
                .status(400)
                .json({ message: "Missing bookingId in request body" });
        }

        console.log("Booking ID validated successfully:", bookingId);

        // Fetch booking data from the database
        console.log("Fetching booking details from the database...");
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            console.error("Error: Booking not found for ID:", bookingId);
            return res.status(404).json({ message: "Booking not found" });
        }

        console.log("Booking Details Fetched Successfully:", booking);

        // Get total price from booking record
        const totalPriceInNPR = booking.totalPrice;
        console.log("Total Price Calculated (in NPR):", totalPriceInNPR);

        // Ensure total price is valid
        if (!totalPriceInNPR || totalPriceInNPR <= 0) {
            console.error(
                "Error: Invalid total price. Total Price:",
                totalPriceInNPR
            );
            return res.status(400).json({ message: "Invalid total price" });
        }

        console.log("Total Price Validated Successfully:", totalPriceInNPR);

        // Create a new Payment record in the database
        console.log("Creating a new Payment entry in the database...");
        const paymentDetails = await Payment.create({
            booking: bookingId,
            user: req.user._id,
            method: "khalti",
            status: "initiated",
            gatewayReference: "",
            amount: totalPriceInNPR,
            currency: "NPR",
            paidAt: null,
        });

        console.log("Payment Entry Created Successfully:", paymentDetails);

        // Check and log the KHALTI secret key
        console.log(
            "KHALTI_SECRET_KEY from environment variables:",
            process.env.KHALTI_SECRET_KEY
        );
        if (!process.env.KHALTI_SECRET_KEY) {
            console.error(
                "Error: KHALTI_SECRET_KEY is not set in environment variables"
            );
            return res.status(500).json({
                message: "Server misconfiguration: Missing KHALTI_SECRET_KEY",
            });
        }

        // Call Khalti API to initiate payment
        console.log("Initiating Khalti payment using Khalti API...");
        const response = await axios.post(
            "https://dev.khalti.com/api/v2/epayment/initiate/",
            {
                return_url: "http://10.0.2.2:3000/api/payment/khalti/callback",
                website_url: "http://10.0.2.2:3000/",
                amount: totalPriceInNPR * 100, // Amount in paisa
                purchase_order_id: paymentDetails._id,
                purchase_order_name: "Futsal book",
                customer_info: {
                    name: req.user.firstName + " " + req.user.lastName,
                    email: req.user.email,
                    phone: req.user.phone || "9800000000",
                },
            },
            {
                headers: {
                    Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("Khalti API Response Received:", response.data);

        // Extract required values from response
        const { pidx, payment_url } = response.data;
        console.log("Extracted PIDX and Payment URL:", { pidx, payment_url });

        // Validate response from Khalti
        if (!pidx || !payment_url) {
            console.error(
                "Error: Missing 'pidx' or 'payment_url' in Khalti API response"
            );
            return res
                .status(500)
                .json({ message: "Invalid Khalti API response" });
        }

        console.log("Khalti Payment Initiation Successful:", {
            pidx,
            payment_url,
        });

        // Update Payment record with PIDX
        console.log("Updating Payment Entry with PIDX...");
        paymentDetails.gatewayReference = pidx;
        await paymentDetails.save();
        console.log(
            "Payment Entry Updated Successfully with PIDX:",
            paymentDetails
        );

        // Send payment URL to client
        console.log("Returning payment URL to the client...");
        return res.status(200).json({ pidx, paymentUrl: payment_url });
    } catch (error) {
        console.error("Error initiating Khalti payment:", error);

        // Axios error handling
        if (error.response) {
            console.error("Axios Error Response Data:", error.response.data);
            console.error(
                "Axios Error Response Status:",
                error.response.status
            );
            console.error(
                "Axios Error Response Headers:",
                error.response.headers
            );
        } else if (error.request) {
            console.error("Axios Error Request:", error.request);
        } else {
            console.error("Axios General Error:", error.message);
        }

        return res.status(500).json({ message: "Failed to initiate payment" });
    }
};

// Handle Khalti callback after user completes payment
const handleKhaltiCallback = async (req, res) => {
    const { pidx } = req.query;

    // Validate PIDX
    if (!pidx) {
        return res
            .status(400)
            .json({ message: "Missing PIDX in query parameters" });
    }

    try {
        // Verify payment status from Khalti API
        const lookupResponse = await axios.post(
            "https://dev.khalti.com/api/v2/epayment/lookup/",
            { pidx },
            {
                headers: {
                    Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const { status, transaction_id } = lookupResponse.data;

        if (status === "Completed") {
            const paymentDetails = await Payment.findOne({
                gatewayReference: pidx,
            });

            if (!paymentDetails) {
                return res.status(404).json({ message: "Payment not found" });
            }

            // Mark booking as paid
            await Booking.findByIdAndUpdate(
                paymentDetails.booking,
                {
                    paymentStatus: "paid",
                    paidAt: new Date(),
                    transactionId: transaction_id,
                },
                { new: true }
            );

            // Update Payment record
            paymentDetails.status = "successful";
            paymentDetails.transactionId = transaction_id;
            paymentDetails.paidAt = new Date();
            await paymentDetails.save();

            // Get user's email
            const user = await User.findById(paymentDetails.user);
            const userEmail = user.email;

            // Get booking details
            const booking = await Booking.findById(
                paymentDetails.booking
            ).populate("venue", "venueName");

            // Prepare booking details for email
            const bookingDetailsForEmail = {
                venueName: booking.venue.venueName,
                date: booking.date,
                startTime: booking.startTime,
                endTime: booking.endTime,
                totalPrice: booking.totalPrice,
            };

            await sendBookingConfirmationEmail(
                userEmail,
                bookingDetailsForEmail
            );
        } else {
            // Redirect to failure page
            return res.redirect("/booking-failure");
        }
    } catch (error) {
        console.error("Error verifying Khalti payment:", error);
        return res.status(500).json({ message: "Failed to verify payment" });
    }
};

// Handle PayPal payment initiation
const handlePaypalPayment = async (req, res) => {
    const { bookingId } = req.body;

    // Validate input
    if (!bookingId) {
        return res.status(400).json({ message: "Missing bookingId" });
    }

    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    try {
        const booking = await Booking.findById(bookingId);
        const totalPriceInNPR = booking.totalPrice;

        // Convert NPR to USD
        const NPR_TO_USD_RATE = 0.0075;
        const totalPriceInUSD = (totalPriceInNPR * NPR_TO_USD_RATE).toFixed(2);

        if (!totalPriceInUSD || parseFloat(totalPriceInUSD) <= 0) {
            return res
                .status(400)
                .json({ message: "Invalid booking total price" });
        }

        const create_payment_json = {
            intent: "sale",
            payer: { payment_method: "paypal" },
            redirect_urls: {
                return_url: `http://10.0.2.2:3000/api/payment/success?bookingId=${bookingId}&userId=${user._id}`,
                cancel_url: "http://10.0.2.2:3000/api/payment/cancel",
            },
            transactions: [
                {
                    item_list: {
                        items: [
                            {
                                name: "Futsal Booking",
                                sku: "booking",
                                price: totalPriceInUSD,
                                currency: "USD",
                                quantity: 1,
                            },
                        ],
                    },
                    amount: {
                        currency: "USD",
                        total: totalPriceInUSD,
                    },
                    description: "Payment for futsal booking.",
                },
            ],
        };

        // Create PayPal payment
        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                console.error(error);
                res.status(500).json({ error: "Payment creation failed" });
            } else {
                const approvalUrl = payment.links.find(
                    (link) => link.rel === "approval_url"
                ).href;

                // Save initial payment record
                Payment.create({
                    booking: bookingId,
                    user: user._id,
                    method: "paypal",
                    status: "initiated",
                    gatewayReference: "",
                    transactionId: "",
                    amount: totalPriceInNPR,
                    currency: "NPR",
                    paidAt: null,
                });

                res.json({ approvalUrl });
            }
        });
    } catch (err) {
        console.error("Error in handlePayment", err);
        res.status(500).json({
            error: "Server error during payment initiation",
        });
    }
};

// Handle successful PayPal payment
const paymentSuccess = async (req, res) => {
    const { PayerID, paymentId, bookingId, userId } = req.query;

    if (!PayerID || !paymentId || !bookingId || !userId) {
        return res.status(400).json({
            message:
                "Missing required parameters: PayerID, paymentId, bookingId, or customerId",
        });
    }

    try {
        const booking = await Booking.findById(bookingId);
        const user = await User.findById(userId);

        if (!booking || !user) {
            return res
                .status(404)
                .json({ message: "Booking or User not found" });
        }

        const NPR_TO_USD_RATE = 0.0075;
        const totalPriceInUSD = (booking.totalPrice * NPR_TO_USD_RATE).toFixed(
            2
        );

        const execute_payment_json = {
            payer_id: PayerID,
            transactions: [
                { amount: { currency: "USD", total: totalPriceInUSD } },
            ],
        };

        // Execute PayPal payment
        paypal.payment.execute(
            paymentId,
            execute_payment_json,
            async (error, payment) => {
                if (error) {
                    return res.status(500).json({
                        error: "Payment execution failed",
                        details: error.response?.data || error.message,
                    });
                }

                const updatedBooking = await Booking.findByIdAndUpdate(
                    bookingId,
                    {
                        paymentStatus: "paid",
                        paidAt: new Date(),
                        paymentId,
                        transactionId: payment.id,
                    },
                    { new: true }
                );

                const savedPayment = await Payment.findOneAndUpdate(
                    { booking: bookingId, method: "paypal" },
                    {
                        status: "successful",
                        gatewayReference: paymentId,
                        transactionId: payment.id,
                        paidAt: new Date(),
                    },
                    { new: true }
                );

                // Get user's email
                const user = await User.findById(userId);
                const userEmail = user.email;

                const booking = await Booking.findById(bookingId).populate(
                    "venue",
                    "venueName"
                );

                // Prepare booking details for email
                const bookingDetailsForEmail = {
                    venueName: booking.venue.venueName,
                    date: booking.date,
                    startTime: booking.startTime,
                    endTime: booking.endTime,
                    totalPrice: booking.totalPrice,
                };

                await sendBookingConfirmationEmail(userEmail, bookingDetailsForEmail);

                res.json({
                    message: "Payment Successful",
                    booking: updatedBooking,
                    paymentDetails: payment,
                    savedPayment,
                });
            }
        );
    } catch (error) {
        res.status(500).json({
            error: "Server error while processing payment success",
            details: error.message,
        });
    }
};

// Handle PayPal cancellation
const paymentCancelled = async (req, res) => {
    res.json({ message: "Payment Cancelled" });
};

// Export all controller functions
module.exports = {
    initiateKhaltiPayment,
    handlePaypalPayment,
    paymentSuccess,
    paymentCancelled,
    handleKhaltiCallback,
};
