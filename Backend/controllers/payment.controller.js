//Backend/controller/payment.controller.js


const path = require("path");
const axios = require("axios");

const paypal = require("paypal-rest-sdk");
const Payment = require("../models/payment.model");
const Booking = require("../models/booking.model");
const User = require("../models/user.model");

paypal.configure({
    mode: "sandbox",
    client_id:
        "AUrwEoUMqCYvg4L3Hbj6B9zagPlSF6z_axTcgwbzQZ_PcvxLcWQXpXPBc0ct7FB5LR4OtAClElmKSn_7",
    client_secret:
        "EEnr8nnNnSU7n_JD9ZwGq7tH3G_xxM1NCCJLdgQ3vb74_dTaKnO1Pd3gJJYdXyhvW9KshUoDHiHu3agw",
});


const initiateKhaltiPayment = async (req, res) => {
    const { bookingId } = req.body;
  
    try {
      console.log("Initiating Khalti payment process...");
  
     
      if (!bookingId) {
        console.error("Error: Missing bookingId in request body");
        return res.status(400).json({ message: "Missing bookingId in request body" });
      }

      console.log("Booking ID validated successfully:", bookingId);
  
      // Fetch booking details from the database
      console.log("Fetching booking details from the database...");
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        console.error("Error: Booking not found for ID:", bookingId);
        return res.status(404).json({ message: "Booking not found" });
      }
      console.log("Booking Details Fetched Successfully:", booking);
  
      // Calculate total price dynamically based on the booking
      const totalPriceInNPR = booking.totalPrice; // Assuming totalPrice is already calculated during booking creation
      console.log("Total Price Calculated (in NPR):", totalPriceInNPR);
  
      // Validate the total price
      if (!totalPriceInNPR || totalPriceInNPR <= 0) {
        console.error("Error: Invalid total price. Total Price:", totalPriceInNPR);
        return res.status(400).json({ message: "Invalid total price" });
      }
      console.log("Total Price Validated Successfully:", totalPriceInNPR);
  
      // Create a new Payment entry in the database
      console.log("Creating a new Payment entry in the database...");
      const paymentDetails = await Payment.create({
        booking: bookingId,
        user: req.user._id,
        method: "khalti",
        status: "initiated",
        gatewayReference: "",
        amount: totalPriceInNPR, // Save the original price in NPR
        currency: "NPR",
        paidAt: null,
      });
      console.log("Payment Entry Created Successfully:", paymentDetails);
  
      // Log the KHALTI_SECRET_KEY being used
      console.log("KHALTI_SECRET_KEY from environment variables:", process.env.KHALTI_SECRET_KEY);
      if (!process.env.KHALTI_SECRET_KEY) {
        console.error("Error: KHALTI_SECRET_KEY is not set in environment variables");
        return res.status(500).json({ message: "Server misconfiguration: Missing KHALTI_SECRET_KEY" });
      }
  
      // Initiate Khalti payment
      console.log("Initiating Khalti payment using Khalti API...");
      const response = await axios.post(
        "https://dev.khalti.com/api/v2/epayment/initiate/",
        {
          return_url: "http://10.0.2.2:3000/api/payment/khalti/callback",
          website_url: "http://10.0.2.2:3000/",
          amount: totalPriceInNPR * 100, // Amount in paisa (smallest currency unit)
          purchase_order_id: paymentDetails._id, // Use the Payment ID as purchase_order_id
          purchase_order_name:"Futsal book", // Venue name as product name
          customer_info: {
            name: req.user.firstName + " " + req.user.lastName,
            email: req.user.email,
            phone: req.user.phone || "9800000000", // Default phone if not available
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
  
      // Extract PIDX and payment URL from the response
      const { pidx, payment_url } = response.data;
      console.log("Extracted PIDX and Payment URL:", { pidx, payment_url });
  
      // Validate the Khalti API response
      if (!pidx || !payment_url) {
        console.error("Error: Missing 'pidx' or 'payment_url' in Khalti API response");
        return res.status(500).json({ message: "Invalid Khalti API response" });
      }
      console.log("Khalti Payment Initiation Successful:", { pidx, payment_url });
  
      // Update the Payment entry with the PIDX
      console.log("Updating Payment Entry with PIDX...");
      paymentDetails.gatewayReference = pidx;
      await paymentDetails.save();
      console.log("Payment Entry Updated Successfully with PIDX:", paymentDetails);
  
      // Respond with the payment URL
      console.log("Returning payment URL to the client...");
      return res.status(200).json({ pidx, paymentUrl: payment_url });
  
    } catch (error) {
      console.error("Error initiating Khalti payment:", error);
  
      // Log Axios-specific errors
      if (error.response) {
        console.error("Axios Error Response Data:", error.response.data);
        console.error("Axios Error Response Status:", error.response.status);
        console.error("Axios Error Response Headers:", error.response.headers);
      } else if (error.request) {
        console.error("Axios Error Request:", error.request);
      } else {
        console.error("Axios General Error:", error.message);
      }
  
      // Return a generic error response
      return res.status(500).json({ message: "Failed to initiate payment" });
    }
  };



  const handleKhaltiCallback = async (req, res) => {
    const { pidx } = req.query;
    if (!pidx) {
        return res.status(400).json({ message: "Missing PIDX in query parameters" });
    }

    try {
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
            const paymentDetails = await Payment.findOne({ gatewayReference: pidx });

            if (!paymentDetails) {
                return res.status(404).json({ message: "Payment not found" });
            }

           
            await Booking.findByIdAndUpdate(
                paymentDetails.booking,
                {
                    paymentStatus: "paid",
                    paidAt: new Date(),
                    transactionId: transaction_id,
                },
                { new: true }
            );

            
            paymentDetails.status = "successful";
            paymentDetails.transactionId = transaction_id;
            paymentDetails.paidAt = new Date();
            await paymentDetails.save();

            // return res.redirect("/booking-success");
        } else {
            return res.redirect("/booking-failure");
        }
    } catch (error) {
        console.error("Error verifying Khalti payment:", error);
        return res.status(500).json({ message: "Failed to verify payment" });
    }
}



const handlePaypalPayment = async (req, res) => {
    const { bookingId } = req.body;

    if (!bookingId) {
        return res.status(400).json({ message: "Missing bookingId" });
    }

    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    try {
        // Fetch the booking details from the database
        const booking = await Booking.findById(bookingId);

        // Original price in NPR (store this in the database)
        const totalPriceInNPR = booking.totalPrice;

        // Conversion rate (NPR to USD)
        // You can fetch this dynamically from an API or use a fixed rate
        const NPR_TO_USD_RATE = 0.0075; //Example: 1 NPR= 0.0075 USD

        // Convert the price to USD for PayPal
        const totalPriceInUSD = (totalPriceInNPR * NPR_TO_USD_RATE).toFixed(2);

        //Validate the converted price
        if (!totalPriceInUSD || parseFloat(totalPriceInUSD) <= 0) {
            return res
                .status(400)
                .json({ message: "Invalid booking total price" });
        }

        const create_payment_json = {
            intent: "sale",
            payer: {
                payment_method: "paypal",
            },
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
                                price: totalPriceInUSD, // Total in USD
                                currency: "USD",
                                quantity: 1,
                            },
                        ],
                    },
                    amount: {
                        currency: "USD",
                        total: totalPriceInUSD, // Total in USD
                    },
                    description: "Payment for futsal booking.",
                },
            ],
        };

        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                console.error(error);
                res.status(500).json({ error: "Payment creation failed" });
            } else {
                const approvalUrl = payment.links.find(
                    (link) => link.rel === "approval_url"
                ).href;

                // Save the original NPR price and converted USD price in the database
                Payment.create({
                    booking: bookingId,
                    user: user._id,
                    method: "paypal",
                    status: "initiated",
                    gatewayReference: "", // Will be updated after payment completion
                    transactionId: "", // Will be updated after payment completion
                    amount: totalPriceInNPR, // Save the original price in NPR
                    currency: "NPR", // Save the original currency
                    paidAt: null,
                });

                // Respond with the approval URL
                res.json({ approvalUrl });
            }
        });
    } catch (err) {
        console.error("Error in handlePayment", err);
        res.status(500).json({
            error: "Server error during payment initiation",
        });
    }
}



const paymentSuccess = async (req, res) => {
    const { PayerID, paymentId, bookingId, userId } = req.query;

    console.log("Received query parameters:", { PayerID, paymentId, bookingId, userId });

    if (!PayerID || !paymentId || !bookingId || !userId) {
        console.warn("Missing required parameters in query");
        return res.status(400).json({
            message:
                "Missing required parameters: PayerID, paymentId, bookingId, or customerId",
        });
    }

    try {
        console.log("Fetching booking with ID:", bookingId);
        const booking = await Booking.findById(bookingId);

        console.log("Fetching user with ID:", userId);
        const user = await User.findById(userId);

        if (!booking || !user) {
            console.error("Booking or User not found", { booking, user });
            return res
                .status(404)
                .json({ message: "Booking or User not found" });
        }

        // Log total price being used for PayPal transaction
        console.log("Booking totalPrice:", booking.totalPrice);// Use a fixed rate or fetch dynamically
        const NPR_TO_USD_RATE = 0.0075;
        const totalPriceInUSD = (booking.totalPrice * NPR_TO_USD_RATE).toFixed(2);



        const execute_payment_json = {
            payer_id: PayerID,
            transactions: [
                {
                    amount: {
                        currency: "USD",
                        total: totalPriceInUSD, 
                        // total: booking.totalPrice.toString(),
                    },
                },
            ],
        };

        console.log("Executing PayPal payment with JSON:", execute_payment_json);

        paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
            if (error) {
                console.error("Error executing PayPal payment:", error.response?.data || error);
                return res.status(500).json({
                    error: "Payment execution failed",
                    details: error.response?.data || error.message,
                });
            }

            console.log("PayPal payment executed successfully:", payment);

            console.log("Updating Booking status to 'paid' for booking ID:", bookingId);
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

            console.log("Updated Booking:", updatedBooking);

            console.log("Updating Payment record for booking ID:", bookingId);
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

            console.log("Updated Payment record:", savedPayment);

            console.log("Sending success response...");
            res.json({
                message: "Payment Successful",
                booking: updatedBooking,
                paymentDetails: payment,
                savedPayment,
            });
        });
    } catch (error) {
        console.error("Unexpected error in payment success handler:", error);
        res.status(500).json({
            error: "Server error while processing payment success",
            details: error.message,
        });
    }
};

const paymentCancelled = async (req, res) => {
    res.json({ message: "Payment Cancelled" });
};

module.exports = {
    initiateKhaltiPayment,
    handlePaypalPayment,
    paymentSuccess,
    paymentCancelled,
    handleKhaltiCallback,
};