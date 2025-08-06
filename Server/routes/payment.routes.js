const express = require('express');
const router = express.Router();
const { createPayment, getPaymentsByOrderId } = require('../controllers/payment.controller');

// Create a new payment
router.post('/', createPayment);

// Get payments for a specific order
router.get('/:orderId', getPaymentsByOrderId);

module.exports = router;