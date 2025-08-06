const express = require('express');
const { addToCart, updateCartItem, removeCartItem, getCart, addToCartByBarcode } = require('../controllers/cart.controller');

const router = express.Router();

router.get('/', getCart);
router.post('/add/:productId', addToCart);
router.post('/addByBarcode', addToCartByBarcode);
router.put('/update/:productId', updateCartItem);
router.delete('/remove/:productId', removeCartItem);

module.exports = router;