const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  barcode: { 
    type: String, 
    required: true // Stores barcode image URL
  },
  barcodeNumber: { 
    type: String, 
    required: true, 
    unique: true // Stores numeric barcode
  },
  name: { 
    type: String, 
    required: true 
  },

  price: { 
    type: Number, 
    required: true 
  },

   
  stock: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  description: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subcategory"
  },
  homeVisibility: { type: Boolean, default: false },
  size: [String],
  color: String,
  fabric: String,
  images: [String]
});

module.exports = mongoose.model('product', productSchema);