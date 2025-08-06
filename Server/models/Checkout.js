const mongoose = require('mongoose');

const CheckoutSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    default: 'United States',
    enum: ['United States']  // Optional: If only US allowed
  },
  streetAddress: {
    type: String,
    required: true,
    trim: true
  },
  apartment: {
    type: String,
    trim: true,
    default: ''
  },
  city: {
    type: String,
    required: true,
    default: 'San Francisco', // corrected spelling from "Sans Fransisco"
    trim: true
  },
  postCode: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type:String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Module', CheckoutSchema);
