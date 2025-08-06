const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming a User model exists
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    productname: {
      type: String,
      required: true,
    },
    paymentMode: {
      type: String,
      enum: ["Online Transfer", "Cash", "Cheque"],
      default: "Online Transfer",
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    receivingDate: {
      type: Date,
      default: Date.now,
    },
    chequeNumber: {
      type: Number,
    },
    remark: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);