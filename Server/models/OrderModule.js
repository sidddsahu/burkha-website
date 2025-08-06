const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payments' }],
dueAmount: Number,
totalPriceAfterDiscount: Number,
paymentStatus: String,

});

module.exports = mongoose.model('Orders', orderSchema);
