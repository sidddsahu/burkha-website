const Banner = require("../models/BannerModule");
const imagekit = require("../config/imageKit");

const BannerSave = async (req, res) => {
  try {
    const { URL } = req.body;

    // Handle uploaded file (assuming single image input field named "images")
    const file = req.files?.images;

    if (!file || !URL) {
      return res.status(400).json({ message: "Image and URL are required." });
    }

    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: file.data, // get buffer
      fileName: file.name,
    });

    // Save to DB
    const newBanner = new Banner({
      URL,
      images: [uploadResponse.url],
    });

    await newBanner.save();

    console.log("Banner created:", newBanner);
    res.status(201).json(newBanner);
  } catch (error) {
    console.error("Error creating banner:", error);
    res.status(500).json({ error: error.message });
  }
};


const getAllBanner = async (req, res) => {
    try {
        const products = await Banner .find();
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: error.message });
    }
};

const BannerDelete = async(req, res)=>{

     const {id} = req.params;
   await Banner.findByIdAndDelete(id);

    res.status(200).send("Task deleted")
}


module.exports = {
  BannerSave,
  getAllBanner,
  BannerDelete
};
