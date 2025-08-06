const Banner = require("../models/BrandModule");
const imagekit = require('../config/imageKit');

const BlogSave = async (req, res) => {
  try {
    const {
    Brandname,
    } = req.body;

    // Handle image uploads
    const uploadedImages = [];
    const filesRaw = req.files?.images;

    if (filesRaw) {
      const files = Array.isArray(filesRaw) ? filesRaw : [filesRaw];

      for (let file of files) {
        const buffer = file.data;
        const uploadResponse = await imagekit.upload({
          file: buffer,
          fileName: file.name,
        });
        uploadedImages.push(uploadResponse.url);
      }
    }

    const banner = await Banner.create({
      images: uploadedImages,
    Brandname
    });

    res.status(201).json(banner);
  } catch (error) {
    console.error('BannerSave error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};


const BrandDisplay = async (req, res) => {
    try {
        const myData = await Banner.find();
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
        const deletedEnquiry = await Banner.findByIdAndDelete(id);

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

module.exports = {BlogSave, BrandDisplay,RecordDelete}

