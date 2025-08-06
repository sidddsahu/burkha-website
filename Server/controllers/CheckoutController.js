const Checkout = require('../models/Checkout'); // Update path as needed

// @desc   Create a new checkout entry
// @route  POST /api/checkout
// @access Public
const createCheckout = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      businessName,
      country,
      streetAddress,
      apartment,
      city,
      postCode,
      phone,
      email
    } = req.body;

    // Validate required fields manually if needed (already handled in Mongoose too)
    if (!firstName || !lastName || !businessName || !streetAddress || !city || !postCode || !phone) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    const checkoutData = new Checkout({
      firstName,
      lastName,
      businessName,
      country,
      streetAddress,
      apartment,
      city,
      postCode,
      phone,
      email
    });

    const savedData = await checkoutData.save();
    res.status(201).json({ message: 'Checkout information saved successfully', data: savedData });

  } catch (error) {
    console.error('Error saving checkout data:', error);
    res.status(500).json({ message: 'Server error. Could not save checkout data.' });
  }
};

const ContactDisplay = async (req, res) => {
    try {
        const myData = await Checkout.find();
        res.status(200).json({
            success: true,
            data: myData
        });
    } catch (error) {
        console.error("Fetching enquiries error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch enquiries",
            error: error.message
        });
    }
};


module.exports = {
  createCheckout,
  ContactDisplay
};
