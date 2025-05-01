require('dotenv').config();


const express = require('express');
const cookieParser= require("cookie-parser");
const cors = require("cors");
const connectDB= require('./config/db')
const path = require("path");

const app = express()
const port = process.env.PORT 

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "checkout"));

const userRoutes= require("./routes/user.routes")
const venueRoutes= require("./routes/venue.routes")
const paymentRoutes= require("./routes/payment.routes")
const bookingRoutes= require("./routes/booking.routes");
const reviewRoutes= require("./routes/review.routes");
const dashboardRoutes= require("./routes/dashboard.routes")

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
  credentials: true, 
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

connectDB();




app.use("/uploads", express.static('public/uploads'));

// app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
app.use("/api/user", userRoutes);
app.use("/api/venue", venueRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/bookings", bookingRoutes );
app.use("/api/review", reviewRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get('/', (req, res) => {
  res.send('Backend for React Native App is running!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});