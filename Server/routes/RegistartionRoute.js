const express = require('express');

const router = express.Router();
const userControler   = require('../controllers/RegitrationController');// Ensure correct spelling

// Define the registration route
router.post('/register', userControler.Registration ); // Explicitly define the route for registration
router.post('/login', userControler.Login); // Explicitly define the route for registration
router.get('/', userControler.getAllUsers);
router.get("/:id", userControler.getVendorById)





// router.post('/register', userControler.Registration);
router.get('/users', userControler.getAllUsers);
router.get('/users/:id', userControler.getUserById);
router.put('/users/:id', userControler.updateUser);
router.delete('/users/:id', userControler.deleteUser);



router.post('/resetpassword',userControler.resetPassword)
module.exports = router;