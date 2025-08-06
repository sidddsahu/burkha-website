const express = require('express');
const { getProductByBarcode, scanAndIncreaseQuantity } = require('../controllers/purchase2.controller');
const router = express.Router();

router.get("/barcode/purchase/:barcode", getProductByBarcode);
router.put("/scans", scanAndIncreaseQuantity);

module.exports = router;