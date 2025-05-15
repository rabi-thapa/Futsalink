//Backend/controller/user.controller.js


require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const moment = require('moment');
const nodemailer = require('nodemailer');


// Function to generate new access and refresh tokens for a user
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        console.log("Generating tokens for userId: ", userId);
        const user = await User.findById(userId);


         // Generate access and refresh tokens using model methods
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        console.log("generated access token", accessToken);
        console.log("generated refreshToken", refreshToken);

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false }); // Save refresh token

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating refresh and access token"
        );
    }
};


// Get current authenticated user
const getCurrentUser = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            throw new ApiError(401, "Unauthorized - User not found");
        }

        console.log("current", user)

        return res.status(200).json({
            statusCode: 200,
            success: true,
            message: "User fetched successfully",
            user,
            userId: user._id,
            userRole: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            profileImage: user.profileImage,
            refreshToken: user.refreshToken,
        });
    } catch (error) {
        console.error("Error fetching current user:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// Register new user
const signupUser = async (req, res) => {
    try {
 

        const {
            firstName,
            role,
            email,
            password,
        } = req.body;

        // Validate required fields
        if (![firstName, email, password].every(field => field && String(field).trim())) {
            throw new ApiError(400, "All fields are required");
        }

          // Check for duplicate user
        const existedUser = await User.findOne({ email });

        if (existedUser) {
            throw new ApiError(400, "User with this email already exists");
        }

         // Use default profile image if none uploaded
        const defaultImagePath = 'uploads/default-profile.png';
        const profileImagePath = req.file
            ? `uploads/${req.file.filename}`
            : defaultImagePath;

                // Create user
        const user = await User.create({
            firstName,
            role,
            email,
            password,
            status: 1,
            profileImage: profileImagePath,
        });

        if (!user) {
            throw new ApiError(
                500,
                "Something went wrong while registering the user"
            );
        }


           // Generate tokens
        const { accessToken, refreshToken } =
            await generateAccessAndRefreshTokens(user._id);

        await User.findByIdAndUpdate(user._id, { refreshToken });

        return res.status(201).json({
            message: "User registered successfully",
            accessToken,
            refreshToken,
            userId: user._id,
            role: user.role,
        });
    } catch (error) {
        console.error("Signup Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


// Change the user's current password
const changeCurrentPassword = asyncHandler(async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res
                .status(400)
                .json({ message: "Old and new passwords are required" });
        }

        const user = await User.findById(req.body.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordValid = await user.isPasswordCorrect(oldPassword);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid old password" });
        }

        user.password = newPassword;

        await user.save({ validateBeforeSave: false });

        return res.status(200).json({
            statusCode: 200,
            success: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});



// Initial sign-in logic to verify credentials
const proceedSignIn = asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;
  
    
  

    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Email, password, and role are required.",
      });
    }
  

    const user = await User.findOne({ email, role });
  
    if (!user) {
      return res.status(404).json({
        message: "No user found with the provided email and role.",
      });
    }
  
    // Check password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Incorrect password.",
      });
    }
  
    // If all checks pass
    return res.status(200).json({
      message: "User verified successfully.",
    });
  });
  

  // Store OTPs temporarily in memory
const otpStore = {};



// Set up email transporter for sending OTP
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});



// Send OTP to user's email
const sendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
  
    
    if (!email) {
      throw new ApiError(400, "Email is required");
    }
  
   
    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // Generate 4-digit OTP
    otpStore[email] = otp;
  
   
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Verification',
      text: `Your OTP is ${otp}. Please do not share it with anyone.`,
    };
  
    console.log(mailOptions);
  
    await transporter.sendMail(mailOptions);
  
    return res.status(200).json({ message: "OTP sent successfully" });
});





// Verify the OTP sent to user's email
const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
  
    if (!email || !otp) {
      throw new ApiError(400, "Email and OTP are required");
    }
  
    const storedOtp = otpStore[email];
    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    delete otpStore[email]; // Clear OTP after successful verification
  
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  
    return res.status(200).json({
      message: "OTP verified successfully",
      accessToken,
      refreshToken,
      userId: user._id,
      userRole: user.role,
    });
  });
  

  // Sign out the user and clear refresh token
const signOutUser = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            console.log("No user found in request");
            return res.status(401).json({ message: "User not authenticated" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { refreshToken: undefined } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({
                statusCode: 200,
                message: "User Signed Out",
            });
    } catch (error) {
        console.error("Error in signOutUser:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


// Update user's personal account details
const updateAccountDetails = asyncHandler(async (req, res) => {
    console.log(req.body);

    try {
        const userId = req.user._id;

        const {
            firstName,
            lastName,
            email,
            gender,
            dateOfBirth,
            address,
        } = req.body;

        
        if (!firstName || typeof firstName !== 'string' || firstName.trim() === '') {
            return res.status(400).json({ message: 'First name cannot be empty' });
        }

        if (dateOfBirth && !moment(dateOfBirth, moment.ISO_8601, true).isValid()) {
            return res.status(400).json({ message: 'Invalid date format for dateOfBirth' });
        }
d
        const updateData = {
            firstName: firstName.trim(),
            ...(lastName && { lastName: lastName.trim() }),
            ...(email && { email: email.trim() }),
            ...(gender && { gender }),
            ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
            ...(address && { address: address.trim() }),
        };

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'User updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// Update user's profile image
const updateUserProfileImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "Profile Image is missing");
    }

    const profileImagePath = `uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { profileImage: profileImagePath } },
        { new: true }
    ).select('-password');

    return res.status(200).json({
        statusCode: 200,
        success: true,
        user,
        message: "Profile Image is updated successfully"
    });
});

// Refresh access token using a valid refresh token
const refreshAccessToken = asyncHandler(async (req, res) => {
    try {

        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token required" });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const user = await User.findById(decoded._id);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        const newAccessToken = user.generateAccessToken();
        const newRefreshToken = user.generateRefreshToken();

        user.refreshToken = newRefreshToken;

        await user.save();

        res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired refresh token" });
    }
});

// Export all functions
module.exports = {
    getCurrentUser,
    signupUser,

    sendOtp, 
    verifyOtp,
    changeCurrentPassword,
    signOutUser,
    updateAccountDetails,
    updateUserProfileImage,
    refreshAccessToken,
    proceedSignIn
};
