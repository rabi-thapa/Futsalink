const handleKhaltiCallback = async (req, res) => {
    console.log("handleKhaltiCallback function triggered");

    const { pidx } = req.query;
    console.log("PIDX from query parameters:", pidx);

    if (!pidx) {
        console.error("Error: PIDX is missing in the query parameters");
        return res
            .status(400)
            .json({ message: "Missing PIDX in query parameters" });
    }

    try {
        console.log("Attempting to look up payment details using PIDX:", pidx);

        // Log the Khalti secret key being used
        console.log(
            "KHALTI_SECRET_KEY from environment variables:",
            process.env.KHALTI_SECRET_KEY
        );

        // Perform the lookup request to Khalti's API
        const lookupResponse = await axios.post(
            "https://dev.khalti.com/api/v2/epayment/lookup/",
            {
                pidx: pidx,
            },
            {
                headers: {
                    Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("Khalti Lookup Response:", lookupResponse.data);

        const { status, transaction_id } = lookupResponse.data;

        if (!status || !transaction_id) {
            console.error(
                "Error: Missing 'status' or 'transaction_id' in Khalti lookup response"
            );
            return res
                .status(500)
                .json({ message: "Invalid Khalti lookup response" });
        }

        console.log("Payment status from Khalti:", status);

        if (status === "Completed") {
            console.log(
                "Payment status is 'Completed'. Proceeding to update booking details."
            );

            // Find the Payment entry using the pidx
            const paymentDetails = await Payment.findOne({
                gatewayReference: pidx,
            });

            console.log("Found Payment Details in database:", paymentDetails);

            if (!paymentDetails) {
                console.error("Error: No Payment entry found for PIDX:", pidx);
                return res.status(404).json({ message: "Payment not found" });
            }

            console.log(
                "Updating Booking status for booking ID:",
                paymentDetails.booking
            );

            // Update the Booking status
            const updatedBooking = await Booking.findByIdAndUpdate(
                paymentDetails.booking, // Use the bookingId from the Payment model
                { paymentStatus: "Paid", paymentMethod: "Khalti" },
                { new: true }
            );

            console.log("Updated Booking Details:", updatedBooking);

            if (!updatedBooking) {
                console.error(
                    "Error: Failed to update Booking status for booking ID:",
                    paymentDetails.booking
                );
                return res
                    .status(500)
                    .json({ message: "Failed to update booking status" });
            }

            // Update the Payment status
            paymentDetails.status = "successful";
            paymentDetails.transactionId = transaction_id;
            paymentDetails.paidAt = new Date();
            await paymentDetails.save();

            console.log("Updated Payment Details:", paymentDetails);
        } else {
            console.log(
                "Payment status is not 'Completed'. Redirecting to failure screen."
            );
            return res.redirect("/booking-failure");
        }
    } catch (error) {
        console.error("Error verifying Khalti payment:", error);

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

        return res.status(500).json({ message: "Failed to verify payment" });
    }
};