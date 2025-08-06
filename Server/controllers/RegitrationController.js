// const UserModel = require('../models/RegistrationModel');

// const Order = require("../models/orderModel")
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");


// // const Payment = require('../models/payment.modal');
// // Controller to handle user registration
// const Registration = async (req, res) => {
//   const {
//     firmName,
//     contactName,
//     contactType,
//     mobile1,
//     mobile2,
//     whatsapp,
//     email,
//     state,
//     city,
//     address,
//     password,
//     limit,
//     discount
//   } = req.body;

//   try {
//     const user = await UserModel.create({
//       firmName,
//       contactName,
//       contactType,
//       mobile1,
//       mobile2,
//       whatsapp,
//       email,
//       state,
//       city,
//       address,
//       limit,
//       password,
//       discount
//     });

//     res.status(200).send("User successfully registered!");
//   } catch (error) {
//     console.error("Registration error:", error);
//     res.status(500).send("An error occurred during registration.");
//   }
// };

// const Login = async (req, res) => {
//   const { email, password } = req.body;
//   console.log(req.body, "fdfdfgd");
//   // Check for required fields
//   if (!email || !password) {
//     return res.status(400).json({ error: "Email and password are required." });
//   }

//   try {
//     // Find the user by email
//     const user = await UserModel.findOne({ email });

//     if (!user) {
//       return res.status(401).json({ error: "Invalid email or password." });
//     }

//     // // Compare plain-text passwords (⚠️ insecure, just for learning)
//     // if (user.password !== password) {
//     //   return res.status(401).json({ error: "Invalid email or password." });
//     // }

//     // Save minimal user info to session


//     res.status(200).json({ message: "Login successful", user });

//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };


// const getAllUsers = async (req, res) => {
//   try {
//     const users = await UserModel.find({}, { password: 0 });
//     res.status(200).json(users);
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     res.status(500).json({ error: "An error occurred while fetching users." });
//   }
// };

// const getVendorById = async (req, res) => {
//   try {
//     const product = await Order.findById(req.params.id)
//     // console.log(product,'aaaaaaaaaaaa')
//     // RSRSRSconsole.log(product,'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
//     if (!product) {
//       return res.status(404).json({ message: 'Blog not found' });
//     }
//     res.status(200).json(product);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }

// };


// const resetPassword = async (req, res) => {
//   try {
//     const { oldPassword, newPassword, confirmPassword, email } = req.body;

//     // Validate inputs
//     if (!oldPassword || !newPassword || !confirmPassword || !email) {
//       return res.status(400).json({ 
//         success: false,
//         message: "All fields are required" 
//       });
//     }

//     // Check if new passwords match
//     if (newPassword !== confirmPassword) {
//       return res.status(400).json({ 
//         success: false,
//         message: "New passwords do not match" 
//       });
//     }

//     // Find user by email
//     const user = await UserModel.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ 
//         success: false,
//         message: "User not found" 
//       });
//     }

//     // Compare old password
//     const isMatch = await bcrypt.compare(oldPassword, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ 
//         success: false,
//         message: "Old password is incorrect" 
//       });
//     }

//     // Validate new password length
//     if (newPassword.length < 6) {
//       return res.status(400).json({ 
//         success: false,
//         message: "Password must be at least 6 characters" 
//       });
//     }

//     // Hash new password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(newPassword, salt);

//     // Update user password
//     await UserModel.findOneAndUpdate({ email }, { password: hashedPassword });

//     res.status(200).json({
//       success: true,
//       message: "Password reset successfully"
//     });
//   } catch (error) {
//     console.error("Reset password error:", error);
//     res.status(500).json({ 
//       success: false,
//       message: "Server error during password reset",
//       error: error.message 
//     });
//   }
// };

















// module.exports = {
//   Registration,
//   Login,
//   getAllUsers,
//   getVendorById,
//   resetPassword

// };



// const UserModel = require('../models/RegistrationModel');
// const Order = require("../models/orderModel");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// // Register new user
// const Registration = async (req, res) => {
//   const {
//     firmName,
//     contactName,
//     contactType,
//     mobile1,
//     mobile2,
//     whatsapp,
//     email,
//     state,
//     city,
//     address,
//     password,
//     limit,
//     discount
//   } = req.body;

//   try {
//     // Check if user already exists
//     const existingUser = await UserModel.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists with this email." });
//     }

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Create user
//     const user = await UserModel.create({
//       firmName,
//       contactName,
//       contactType,
//       mobile1,
//       mobile2,
//       whatsapp,
//       email,
//       state,
//       city,
//       address,
//       password: hashedPassword,
//       limit,
//       discount
//     });

//     res.status(201).json({ message: "User successfully registered!", userId: user._id });
//   } catch (error) {
//     console.error("Registration error:", error);
//     res.status(500).json({ message: "An error occurred during registration." });
//   }
// };


const UserModel = require('../models/RegistrationModel');
const Order = require("../models/orderModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');

// Register new user (Create)
const Registration = async (req, res) => {
  const {
    firmName,
    contactName,
    contactType,
    mobile1,
    mobile2,
    whatsapp,
    email,
    state,
    city,
    address,
    password,
    limit,
    discount
  } = req.body;

  try {
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await UserModel.create({
      firmName,
      contactName,
      contactType,
      mobile1,
      mobile2,
      whatsapp,
      email,
      state,
      city,
      address,
      password: hashedPassword,
      limit,
      discount
    });

    res.status(201).json({ message: "User successfully registered!", userId: user._id });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "An error occurred during registration." });
  }
};

// Get all users (Read)
// const getAllUsers = async (req, res) => {
//   try {
//     const users = await UserModel.find({}).select('-password'); // Exclude passwords from the response
//     res.status(200).json(users);
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     res.status(500).json({ message: "An error occurred while fetching users." });
//   }
// };

// Get single user by ID (Read)
const getUserById = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "An error occurred while fetching the user." });
  }
};

// Update user (Update)
 // Make sure this is installed

const updateUser = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    // If password is being updated, hash it first
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // ✅ Send email after successful update
    const transporter = nodemailer.createTransport({
      service: "gmail", // or use SMTP settings for production
      auth: {
        user: 'adityajainghetal@gmail.com',  // Secure way: use environment variables
                pass: 'wjiv vwra gbpo mkgr' 
      },
    });

    const mailOptions = {
      from: "adityajainghetal@gmail.com",
      to: updatedUser.email, // make sure `email` is in the user model
      subject: "Your Profile Has Been Updated",
      html: `
        <h3>Hello ${updatedUser.name || "User"},</h3>
        <p>Your profile has been updated successfully.</p>
        <p>If you didn't request this update, please contact support immediately.</p>
        <br />
        <p>Thank you,<br />Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "User updated successfully!", user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "An error occurred while updating the user." });
  }
};


// Delete user (Delete)
const deleteUser = async (req, res) => {
  try {
    const deletedUser = await UserModel.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ message: "User deleted successfully!" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "An error occurred while deleting the user." });
  }
};



// User login
const Login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Create JWT token (optional, include secret)
    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1d' });

    res.status(200).json({ message: "Login successful", token, user: { ...user._doc, password: undefined } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all users (excluding passwords)
const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find({}, { password: 0 });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "An error occurred while fetching users." });
  }
};

// Get vendor/order by ID
const getVendorById = async (req, res) => {
  try {
    const product = await Order.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword, email } = req.body;

  try {
    if (!oldPassword || !newPassword || !confirmPassword || !email) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match." });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await UserModel.findOneAndUpdate({ email }, { password: hashedPassword });

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error during password reset." });
  }
};

module.exports = {
  Registration,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  Login,
  getAllUsers,
  getVendorById,
  resetPassword
};
