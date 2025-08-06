const express = require('express');
const ContactController = require('../controllers/CheckoutController');

const router = express.Router();

router.post('/add', ContactController.createCheckout);
router.get('/display', ContactController.ContactDisplay)






module.exports = router;