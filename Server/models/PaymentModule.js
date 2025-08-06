// models/payment.model.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
  
    orderId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true, min: 0 },
    productname: { type: String },
    cartItems: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    userId: { type: String, required: true },
    FirstName: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postCode: { type: String },
    paymentMode: { type: String, enum: ["Cash", "Cheque", "Online Transfer"], required: true },
    status: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Pending" },
    paymentId: { type: String },
    signature: { type: String },
    createdAt: { type: Date, default: Date.now },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payments', paymentSchema);
