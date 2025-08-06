const UserModel = require('../models/RegisterModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Controller to handle user registration
const Registration = async (req, res) => {
    const { firmName, contact, email, password } = req.body;

    // Validate required fields
    if (!firmName || !contact || !email || !password) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        // Check if user already exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use." });
        }

        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await UserModel.create({
            firmName,
            contact,
            email,
            password: hashedPassword, // Store the hashed password
        });

        res.status(201).json({ 
            message: "User successfully registered!",
            user: {
                id: user._id,
                firmName: user.firmName,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "An error occurred during registration." });
    }
};



const Login = async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    try {
        // Find the user by email
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        // Create a JWT token
        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email,
                firmName: user.firmName
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send the token and basic user info back to the client
        res.status(200).json({ 
            token,
            user: {
                id: user._id,
                firmName: user.firmName,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "An error occurred during login." });
    }
};

module.exports = {
    Registration,
    Login,
};