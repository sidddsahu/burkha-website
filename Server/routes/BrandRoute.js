const express = require('express');
const ContactController = require('../controllers/BrandController');

const router = express.Router();

router.post('/add', ContactController.BlogSave);
router.get('/display', ContactController.BrandDisplay);
router.delete('/alldelete/:id', ContactController.RecordDelete);






module.exports = router;