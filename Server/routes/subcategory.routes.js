const express = require('express');
const { getAllSubcategorys, getSubcategoryById, createSubcategory, updateSubcategory, deleteSubcategory } = require('../controllers/subcatgory.controller');

const router = express.Router();

router.get('/', getAllSubcategorys);
router.get('/:id', getSubcategoryById);
router.post('/', createSubcategory);
router.put('/:id', updateSubcategory);
router.delete('/:id', deleteSubcategory);

module.exports = router;