const mongoose = require('mongoose');

const paymentuserSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },

}, {
  timestamps: true,
});

module.exports = mongoose.model('Payment', paymentuserSchema);