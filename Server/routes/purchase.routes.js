const express = require('express');
const { getProductByBarcode, scanAndIncreaseQuantity,scanAndIncreaseStock } = require('../controllers/puchase.controller');
const router = express.Router();

router.get("/barcode/:barcode", getProductByBarcode);
router.put("/scan", scanAndIncreaseQuantity);
router.put("/scanStock", scanAndIncreaseStock);

module.exports = router;