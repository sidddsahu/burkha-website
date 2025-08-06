const bwipjs = require("bwip-js");

// Function to generate barcode as a Base64 image
const generateBarcode = async (productId) => {
    return new Promise((resolve, reject) => {
        bwipjs.toBuffer(
            {
                bcid: "code128", // Barcode type
                text: productId, // Text to encode (Product ID)
                scale: 3, // Scaling factor
                height: 10, // Bar height, in millimeters
                includetext: true, // Include text below the barcode
                textxalign: "center",
            },
            (err, png) => {
                if (err) reject(err);
                else resolve(`data:image/png;base64,${png.toString("base64")}`);
            }
        );
    });
};

module.exports = {generateBarcode}