const Product = require('../models/product.model');
const imagekit = require('../config/imageKit');
const { generateBarcode } = require('../config/bwip-js.config');

// Get all products
const getAllProducts = async (req, res) => {
    const { search, category } = req.query;
    try {
      const query = {};
      if (search) {
        query.name = { $regex: search, $options: "i" }; // Case-insensitive search
      }
      if (category) {
        query.category = category;
      }
      const products = await Product.find(query).populate("category subCategory");
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products", error });
    }
};

// controllers/productController.js
const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    console.log(query);
    
     if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: "Invalid search query" });
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
      ]
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// const getAllProductshome = async (req, res) => {
//     const { search, category } = req.query;
//     try {
//       const query = {};
//       if (search) {
//         query.name = { $regex: search, $options: "i" }; // Case-insensitive search
//       }
//       if (category) {
//         query.category = category;
//       }
//       const products = await Product.find({ homeVisibility: true,query }).populate("category subCategory");
//       res.status(200).json(products);
//     } catch (error) {
//       res.status(500).json({ message: "Error fetching products", error });
//     }
// };


// const getAllProductshome = async (req, res) => {
//   const { search, category } = req.query;

//   try {
//     const query = { homeVisibility: true }; // Always show only home-visible products

//     if (search) {
//       query.name = { $regex: search, $options: "i" }; // Case-insensitive search
//     }

//     if (category) {
//       query.category = category;
//     }

//     const products = await Product.find(query).populate("category subCategory");

//     res.status(200).json(products);
//   } catch (error) {
//     console.error("Error fetching home products:", error);
//     res.status(500).json({ message: "Error fetching products", error });
//   }
// };


const getAllProductshome = async (req, res) => {
  const { search, category } = req.query;

  try {
    // Base query - only products with homeVisibility: true
    const query = { homeVisibility: true };
    
    // Add search condition if provided
    if (search) {
        query.name = { $regex: search, $options: "i" }; // Case-insensitive search
    }
    
    // Add category filter if provided
    if (category) {
        query.category = category;
    }
    
    // Execute query with population
    const products = await Product.find(query)
    .populate("category subCategory")
    .exec(); // Using .exec() for better promise handling
    console.log(products,'aaaaaaaaaaaaaaaaaaaaaaaaa')

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error) {
    console.error("Error fetching home products:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching products",
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};
// Get a single product by ID
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: error.message });
    }
};

// Create a product
const createProduct = async (req, res) => {
    try {
        const {
            name,
            price,
            description,
            color,
            fabric,
            size,
            category,
            subCategory,
            stock
        } = req.body;

        // Parse JSON string if needed (e.g., size might be sent as stringified array)
        const parsedSize = typeof size === 'string' ? JSON.parse(size) : size;

        // Handle image uploads
        const uploadedImages = [];
        const files = Array.isArray(req.files?.images)
            ? req.files.images
            : [req.files?.images].filter(Boolean);

        for (let file of files) {
            const buffer = file.data;
            const uploadResponse = await imagekit.upload({
                file: buffer,
                fileName: file.name,
            });
            uploadedImages.push(uploadResponse.url);
        }

        // Generate numeric barcode (12 digits for EAN-13 compatibility)
        const barcodeNumber = Date.now().toString().slice(-12).padStart(12, '0');
        const barcodeImage = await generateBarcode(barcodeNumber);

        // Create product without barcode initially
        const newProduct = new Product({
            name,
            price,
            description,
            color,
            fabric,
            size: parsedSize,
            category,
            subCategory,
            images: uploadedImages,
            stock,
            barcodeNumber,
            barcode: barcodeImage
        });

        await newProduct.save();

        // Generate barcode image using barcodeNumber

        

        console.log("Product created:", newProduct);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: error.message });
    }
};

// Update a product
const updateProduct = async (req, res) => {
    try {
        const { name, price, description, color, fabric, size, category, subCategory, images, stock, barcodeNumber } = req.body;
        const parsedSize = size ? (typeof size === 'string' ? JSON.parse(size) : size) : undefined;

        // If barcodeNumber is provided, ensure it's unique
        if (barcodeNumber) {
            const existingProduct = await Product.findOne({ barcodeNumber, _id: { $ne: req.params.id } });
            if (existingProduct) {
                return res.status(400).json({ message: 'Barcode number already in use' });
            }
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { 
                name, 
                price, 
                description, 
                color, 
                fabric, 
                size: parsedSize, 
                category, 
                subCategory, 
                images, 
                stock,
                barcodeNumber
            },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Regenerate barcode image if barcodeNumber changed
        if (barcodeNumber && barcodeNumber !== updatedProduct.barcodeNumber) {
            const barcodeImage = await generateBarcode(barcodeNumber);
            updatedProduct.barcode = barcodeImage;
            await updatedProduct.save();
        }

        console.log("Product updated:", updatedProduct);
        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: error.message });
    }
};

// Purchase a product
const purchaseProduct = async (req, res) => {
    try {
        const { id, quantity } = req.query;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        product.stock -= quantity;
        await product.save();

        console.log("Product purchased:", product);
        res.status(200).json(product);
    } catch (error) {
        console.error("Error purchasing product:", error);
        res.status(500).json({ message: error.message });
    }
};


const getproducthome = async (req, res) => {
  const { homeVisibility } = req.body;

  // Create a new variable to toggle
  const newHomeVisibility = homeVisibility;

  try {
    console.log(homeVisibility,"sdafsa")
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { homeVisibility: homeVisibility },
      { new: true }
    );
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error updating home visibility' });
  }
};


// Delete a product
const deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const products = await Product.find();
        console.log("Product deleted:", deletedProduct);
        res.status(200).json({ message: 'Product deleted successfully', data: products });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: error.message });
    }
};


const getCoursesByCategory = async (req, res) => {
   try {
    const courses = await Product.find({ category: req.params.id });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
  

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, purchaseProduct, searchProducts,getCoursesByCategory,getAllProductshome,getproducthome };