


const Razorpay = require('razorpay');
const Order = require('../models/OrderModule');


// Initialize Razorpay instance with your credentials
const instance = new Razorpay({
  key_id: "rzp_test_o3vkPO5n8pMXdo",
  key_secret: "fENFkA5Mq3eCWjciw8YWKuVi"
});

// Checkout function to create an order
const checkout = async (req, res) => {
  const { amount } = req.body;

  // Validate input
  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid amount."
    });
  }

  try {
    const options = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
    };

    const order = await instance.orders.create(options);

    return res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create order. Please try again later.",
      error: error.message
    });
  }
};

// Payment verification function
const paymentVerification = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId } = req.body;

  // Validate input
  if (!razorpayOrderId || !razorpayPaymentId) {
    return res.status(400).json({
      success: false,
      message: "Missing required parameters."
    });
  }

  try {
    const payment = await instance.payments.fetch(razorpayPaymentId);

    if (payment.status === 'captured') {
      return res.status(200).json({
        success: true,
        razorpayOrderId,
        razorpayPaymentId
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment not successful."
      });
    }
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    return res.status(500).json({
      success: false,
      message: "Payment verification failed. Please try again.",
      error: error.message
    });
  }
};

module.exports = { checkout, paymentVerification };
