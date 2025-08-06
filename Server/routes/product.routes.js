const express = require('express');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, purchaseProduct,searchProducts ,getCoursesByCategory,getAllProductshome,getproducthome} = require('../controllers/product.controller');

const router = express.Router();

router.get('/search', searchProducts);
router.get('/', getAllProducts);
router.post('/', createProduct);
router.put('/purchase', purchaseProduct);
router.get("/allproduct", getAllProductshome);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.get('/:id', getProductById);
router.get('/category/:id',getCoursesByCategory);
router.put("/:id/home-visibility",getproducthome)
// router.put("/:id/home-visibility",getAllProductshome)



module.exports = router;