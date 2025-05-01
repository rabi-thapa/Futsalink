const express = require("express");
const router = express.Router();

const paypal = require("paypal-rest-sdk");

paypal.configure({
    mode: "sandbox", //sandbox or live
    client_id:
        "AUrwEoUMqCYvg4L3Hbj6B9zagPlSF6z_axTcgwbzQZ_PcvxLcWQXpXPBc0ct7FB5LR4OtAClElmKSn_7",
    client_secret:
        "EEnr8nnNnSU7n_JD9ZwGq7tH3G_xxM1NCCJLdgQ3vb74_dTaKnO1Pd3gJJYdXyhvW9KshUoDHiHu3agw",
});

const {
    initiateKhaltiPayment,
    handleKhaltiCallback,
    handlePaypalPayment,
    paymentSuccess,
    paymentCancelled,
} = require("../controllers/payment.controller");
const verifyToken = require("../middlewares/auth.middleware");

// Route to handle PayPal payment request
router.post("/paypal", verifyToken, handlePaypalPayment);



router.post('/khalti', verifyToken, initiateKhaltiPayment);

router.get('/khalti/callback', handleKhaltiCallback);

router.get("/success", paymentSuccess);

router.get("/cancel", paymentCancelled);

module.exports = router;
