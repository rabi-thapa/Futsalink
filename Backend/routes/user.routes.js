const express = require("express");
const router = express.Router();

const upload= require('../middlewares/multer.middleware')
const verifyToken= require('../middlewares/auth.middleware')

const{
    changeCurrentPassword,
    checkEmailAndRole,
    // signinUser,
    sendOtp,
    verifyOtp,
    signupUser,
    signOutUser,
    getCurrentUser,
    updateAccountDetails,
    updateUserProfileImage,
    refreshAccessToken,
    
}= require("../controllers/user.controller");

router.post("/", upload.single('profileImage'), signupUser);
router.post("/check-email", checkEmailAndRole);
// router.post("/signIn", signinUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/changePassword", verifyToken, changeCurrentPassword);
router.post("/refresh-token", refreshAccessToken);
router.get("/current-user", verifyToken, getCurrentUser);
router.put("/updateAccountDetails", verifyToken, updateAccountDetails);
router.put("/updateProfileImage", verifyToken, upload.single('profileImage'), updateUserProfileImage);
router.post('/signOut', verifyToken, signOutUser);


module.exports= router;
