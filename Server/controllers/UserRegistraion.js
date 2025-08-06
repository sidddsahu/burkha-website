const UserModel = require('../models/');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



const Registration = async (req, res) => {
    const {
        firmName,
        email,
        password,
        
    } = req.body;

    try {
        const user = await UserModel.create({
            firmName,
            email,
            password,
            
        });

        res.status(200).send("User successfully registered!");
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).send("An error occurred during registration.");
    }
};
const Login = async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required. emaIL" });
    }

    try {
        // Find the user by email
        const user = await UserModel.findOne({ email });
       
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password. " });
        }

 

        // Send the token back to the client
        res.status(200).json({ user });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "An error occurred during login." });
    }
};


module.exports = {
    Registration,
    Login
}
