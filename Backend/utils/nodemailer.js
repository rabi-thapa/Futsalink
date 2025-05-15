const nodemailer = require("nodemailer");

// Reuse the same transporter as in user.controller.js
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


const sendBookingConfirmationEmail = async (userEmail, bookingDetails) => {
    const mailOptions = {
        from: `"Futsal Booking System" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: "✅ Your Booking Has Been Confirmed!",
        html: `
            <h2>🎉 Booking Confirmation</h2>
            <p>Hello,</p>
            <p>Your booking has been confirmed successfully. Here are the details:</p>
            <ul>
                <li><strong>Venue:</strong> ${bookingDetails.venueName}</li>
                <li><strong>Date:</strong> ${new Date(bookingDetails.date).toDateString()}</li>
                <li><strong>Time:</strong> ${bookingDetails.startTime} - ${bookingDetails.endTime}</li>
                <li><strong>Total Price:</strong> NPR ${bookingDetails.totalPrice}</li>
            </ul>
            <p>Thank you for choosing us!</p>
            <p>Best regards,<br>Futsal Booking Team</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Booking confirmation email sent to:", userEmail);
    } catch (error) {
        console.error("Error sending email:", error.message);
    }
};

module.exports = {
    sendBookingConfirmationEmail
};