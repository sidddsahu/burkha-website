const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  firmName: {
    type: String,
    required: true,
  },
  contactName: {
    type: String,
    
  },
  contactType: {
    type: String,
    
  },
  mobile1: {
    type: String,
   
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v); // Validate that it's exactly 10 digits
      },
      message: props => `${props.value} is not a valid mobile number!`
    }
  },
   order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
  },
  mobile2: {
    type: String,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v); // Optional, validate if provided
      },
      message: props => `${props.value} is not a valid mobile number!`
    }
  },
  whatsapp: {
    type: String,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v); // Optional, validate if provided
      },
      message: props => `${props.value} is not a valid WhatsApp number!`
    }
  },
  email: {
    type: String,
    required: true,
    // unique: true, // Ensure email is unique
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); // Basic email validation
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  state: {
    type: String,
    
  },
  city: {
    type: String,
   
  },
  address: {
    type: String,
   
  },
  
  password:{
    type:String,
 
  },
  discount:{
    type:Number,
   
  },
  limit:{
    type:Number,
  
  },
}, { timestamps: true }); // Automatically manage createdAt and updatedAt fields

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;