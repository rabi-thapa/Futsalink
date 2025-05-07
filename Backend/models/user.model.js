const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            trim: true,
            required: true,
        },
        lastName: {
            type: String,
            trim: true,
        },
        role: {
            type: String,
            required: true,
            enum: ["customer", "vendor"],
        },
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true,
        },

        password: {
            type: String,
            required: true,
        },
        status: {
            type: Number,
            enum: [1, 0, -1],
            default: 1,
        },

        gender: {
            type: String,
            enum: ["m", "f", "o"],
            default: null,
        },
        dob: {
            type: String,
            default: null,
        },

        profileImage: {
            type: String,
        },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            firstName: this.firstName,
            role: this.role,
        },

        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

const User = mongoose.model("User", userSchema);
module.exports = User;
