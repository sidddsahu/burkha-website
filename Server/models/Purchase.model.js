const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  quantity: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  purchaseDate: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('purchase', purchaseSchema);