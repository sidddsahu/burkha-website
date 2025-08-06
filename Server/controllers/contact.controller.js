const EnquiryModel = require('../models/Contact.model');
const nodemailer = require('nodemailer'); // You missed this import

const ContactProduct = async (req, res) => {
    const { name, email, phone, subject, message } = req.body; // Added productName here

    try {
        const enquiry = await EnquiryModel.create({
            name,
            email,
            phone,
            subject,
            message,
        });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'adityajainghetal@gmail.com',  // Secure way: use environment variables
                pass: 'wjiv vwra gbpo mkgr' 
            }
        });

        const mailOptions = {
            from: email,
            to: 'adityajainghetal@gmail.com', 
            subject: 'Enquiry Received', 
            text: `Thank you for your enquiry.\n\n\n
            Name: ${name}\n
            Email: ${email}\n
            Phone: ${phone}\n

            Message: ${message}`
        };

        await transporter.sendMail(mailOptions); // use await instead of callback function for better control

        res.status(201).json({
            success: true,
            message: "User enquiry successfully sent",
            data: enquiry
        });
        
    } catch (error) {
        console.error("Enquiry error:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred during enquiry submission",
            error: error.message
        });
    }
};

const ContactDisplay = async (req, res) => {
    try {
        const myData = await EnquiryModel.find();
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

const RecordDelete = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedEnquiry = await EnquiryModel.findByIdAndDelete(id);

        if (!deletedEnquiry) {
            return res.status(404).json({
                success: false,
                message: "Enquiry not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Enquiry deleted successfully",
            data: deletedEnquiry
        });
    } catch (error) {
        console.error("Error deleting enquiry:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete enquiry",
            error: error.message
        });
    }
};

module.exports = {
    ContactProduct,
    ContactDisplay,
    RecordDelete
};
