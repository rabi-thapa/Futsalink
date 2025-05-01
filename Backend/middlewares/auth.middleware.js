const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const verifyToken = asyncHandler(async (req, res, next) => {
    try {
     
      const token = req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1];
      
      // console.log("Token retrieved:", token);
  
      if (!token) {

        throw new ApiError(401, "Unauthorized request");
      }
  
      // console.log(" Access token secret:", process.env.ACCESS_TOKEN_SECRET);
  
      let decodedToken;
  
      try {
      
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        

        
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          console.log("⏳ Token expired, requesting refresh...");
          return res.status(401).json({ message: "Token expired, please refresh your token." });
        }
        throw new ApiError(401, "Invalid Access Token");
      }
  
     
      const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
  
      // console.log("🔍 User found:", user);
  
      if (!user) {
        console.log("User not found.");
        throw new ApiError(401, "Invalid Access Token");
      }
  
      // Attach user data to request
      req.user = user;
  
      // console.log("✅ User attached to request:", req.user);
  
      next();


    } catch (error) {
      console.error("⚠️ Auth Middleware Error:", error);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  });

module.exports = verifyToken;
