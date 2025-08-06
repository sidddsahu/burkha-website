const express = require('express');

const router = express.Router();
const userControler   = require('../controllers/RegitrationController');// Ensure correct spelling

// Define the registration route
router.post('/register', userControler.Registration ); // Explicitly define the route for registration
router.post('/login', userControler.Login);



module.exports = router;