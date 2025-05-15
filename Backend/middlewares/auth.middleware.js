const asyncHandler = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const verifyToken = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access token missing. Unauthorized request." });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired. Please refresh your token." });
      }
      return res.status(401).json({ message: "Invalid access token." });
    }

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    if (!user) {
      return res.status(401).json({ message: "User not found. Invalid token." });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication Middleware Error:", error);
    return res.status(500).json({ message: "Internal server error during authentication." });
  }
});

module.exports = verifyToken;
