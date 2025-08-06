// const router = require("express").Router();
// const Razorpay = require("razorpay");
// const crypto = require("crypto");
// const OrderModel = require("../models/PaymentModule");
// const Payments = require("../models/payment.modal"); // Corrected import
// const Product = require("../models/product.model");
// const mongoose = require("mongoose");
// const PDFDocument = require('pdfkit');
// // Map frontend payment modes to backend
// const paymentModeMap = {
//   payment1: "Online Transfer", // Direct Bank Transfer
//   payment2: "Cheque", // Check Payments
//   payment3: "Cash", // Cash on Delivery
// };

// // Create Razorpay Order
// router.post("/orders", async (req, res) => {
//   try {
//     const {
//       amount,
//       productname,
//       cartItems,
//       FirstName,
//       address,
//       email,
//       id,
//       phone,
//       city,
//       state,
//       postCode,
//       paymentMode,
//       chequeNumber,
//     } = req.body;

 
//     // Validate required fields
//     if (
//       !amount ||
//       isNaN(amount) ||
//       !cartItems ||
//       !Array.isArray(cartItems) ||
//       cartItems.length === 0 ||
//       !FirstName ||
//       !address ||
//       !email ||
//       !phone ||
//       !city ||
//       !state ||
//       !paymentMode
//     ) {
//       return res.status(400).json({ message: "Missing or invalid fields required" });
//     }

//     // Validate payment mode
//     const mappedPaymentMode = paymentModeMap[paymentMode];
 
//     if (!mappedPaymentMode) {
//       return res.status(400).json({ message: "Invalid payment mode" });
//     }

//     // Validate chequeNumber for cheque payments
//     if (mappedPaymentMode === "cheque" && !chequeNumber) {
//       return res.status(400).json({ message: "Cheque number required for cheque payments" });
//       }

//     // Validate stock availability
//     for (const item of cartItems) {
//       const product = await Product.findById(item.productId);
//       if (!product) {
//         return res.status(404).json({ message: `Product not found: ${item.name}` });
//         }
//       if (product.stock < item.quantity) {
//         return res.status(400).json({ message: `Insufficient stock for product: ${item.name}` });
//         }
//     }

//     let order;

//     if (mappedPaymentMode === "Online Transfer") {
//       // Create Razorpay order for online payments
//       const instance = new Razorpay({
//         key_id: process.env.KEY_ID,
//         key_secret: process.env.KEY_SECRET,
//       });

//       const options = {
//         amount: amount * 100, // Convert to paise
//         currency: "INR",
//         receipt: crypto.randomBytes(10).toString("hex"),
//       };

//       order = await new Promise((resolve, reject) => {
//         instance.orders.create(options, (error, order) => {
//           if (error) {
//             reject(error);
//           } else {
//             resolve(order);
//           }
//         });
//       });
//     } else {
//       // Mock order ID for cash/cheque
//       order = { id: `manual-${crypto.randomBytes(10).toString("hex")}` };
//     }



//     // Save order details
 
//     await OrderModel.create({
//       orderId: order.id,
//       amount,
//       productname,
//       cartItems,
//       userId: id,
//       FirstName,
//       address,
//       email,
//       phone,
//       city,
//       state,
//       postCode,
//       paymentMode: mappedPaymentMode,
//       status: "Pending",
//     });
 
//     // Save payment details
//     await Payments.create({
//       amount,
//       paymentMode: mappedPaymentMode,
//       chequeNumber: mappedPaymentMode === "cheque" ? chequeNumber : undefined,
//       receivingDate: new Date(),
//       productname,
//       status: "Pending",
//       userId: id,
//       orderId: order.id,
//       remark: productname,
//     });

//     res.status(200).json({ data: order });
//   } catch (error) {
//     console.error("Error in /orders:", error);
//     res.status(500).json({ message: "Internal Server Error!", error: error.message });
//   }
// });

// // Verify Payment (online only)
// router.post("/verify", async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//     // Validate request body
//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         message: "Missing required fields!",
//         error: "Required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature",
//       });
//     }

//     const generated_signature = crypto
//       .createHmac("sha256", process.env.KEY_SECRET)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest("hex");

//     if (generated_signature === razorpay_signature) {
//       // Find order
//       const order = await OrderModel.findOne({ orderId: razorpay_order_id }).session(session);
//       if (!order) {
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(404).json({ success: false, message: "Order not found" });
//       }

//       // Update stock for online payments
//       if (order.paymentMode === "Online Transfer") {
//         for (const item of order.cartItems) {
//           const product = await Product.findById(item.productId).session(session);
//           if (!product) {
//             await session.abortTransaction();
//             session.endSession();
//             return res.status(404).json({ message: `Product not found: ${item.name}` });
//           }
//           if (product.stock < item.quantity) {
//             await session.abortTransaction();
//             session.endSession();
//             return res.status(400).json({ message: `Insufficient stock for product: ${item.name}` });
//           }
//           await Product.findByIdAndUpdate(
//             item.productId,
//             { $inc: { stock: -item.quantity } },
//             { new: true, session }
//           );
//         }
//       }

//       // Update order status
//       await OrderModel.findOneAndUpdate(
//         { orderId: razorpay_order_id },
//         {
//           status: "Completed",
//           paymentId: razorpay_payment_id,
//           signature: razorpay_signature,
//         },
//         { session }
//       );

//       // Update payment status
//       await Payments.findOneAndUpdate(
//         { orderId: razorpay_order_id },
//         { status: "Completed" },
//         { session }
//       );

//       await session.commitTransaction();
//       session.endSession();

//       res.status(200).json({
//         success: true,
//         message: "Payment verified successfully",
//         orderId: razorpay_order_id,
//         paymentId: razorpay_payment_id,
//       });
//     } else {
//       await session.abortTransaction();
//       session.endSession();
//       res.status(400).json({
//         success: false,
//         message: "Payment verification failed",
//         error: "Invalid signature",
//       });
//     }
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error("Error in /verify:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error!",
//       error: error.message,
//     });
//   }
// });

// // Confirm Order (cash/cheque)
// router.post("/confirm-order", async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     const { orderId } = req.body;

//     if (!orderId) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({ message: "Missing orderId" });
//     }

//     const order = await OrderModel.findOne({ orderId }).session(session);
//     if (!order) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({ message: "Order not found" });
//     }

//     if (order.status === "Completed") {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({ message: "Order already completed" });
//     }

//     // Update stock for cash/cheque
//     if (order.paymentMode === "cash" || order.paymentMode === "cheque") {
//       for (const item of order.cartItems) {
//         const product = await Product.findById(item.productId).session(session);
//         if (!product) {
//           await session.abortTransaction();
//           session.endSession();
//           return res.status(404).json({ message: `Product not found: ${item.name}` });
//         }
//         if (product.stock < item.quantity) {
//           await session.abortTransaction();
//           session.endSession();
//           return res.status(400).json({ message: `Insufficient stock for product: ${item.name}` });
//         }
//         await Product.findByIdAndUpdate(
//           item.productId,
//           { $inc: { stock: -item.quantity } },
//           { new: true, session }
//         );
//       }
//     }

//     // Update order and payment status
//     await OrderModel.findOneAndUpdate({ orderId }, { status: "Completed" }, { session });
//     await Payments.findOneAndUpdate({ orderId }, { status: "Completed" }, { session });

//     await session.commitTransaction();
//     session.endSession();

//     res.status(200).json({ success: true, message: "Order confirmed successfully" });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error("Error in /confirm-order:", error);
//     res.status(500).json({ message: "Internal Server Error!", error: error.message });
//   }
// });

// // Fetch Payments by User ID
// router.get("/payments/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;

//     if (!userId) {
//       return res.status(400).json({ message: "Invalid user ID" });
//     }

//     const payments = await Payments.find({ userId })
//       .select("productname orderId amount paymentMode status receivingDate remark")
//       .sort({ receivingDate: -1 });

//     if (!payments || payments.length === 0) {
//       return res.status(404).json({ message: "No payments found for this user" });
//     }

//     res.status(200).json({ data: payments });
//   } catch (error) {
//     console.error("Error in /payments/:userId:", error);
//     res.status(500).json({ message: "Internal Server Error!", error: error.message });
//   }
// });







// // const fs = require('fs');
// // const path = require('path');
// // const OrderModel = require("../models/PaymentModule");
// // const Payments = require("../models/payment.modal");


// // Download Invoice
// router.get("/downloadinvoice/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;

//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }
//     // Find the payment for this user (assuming you want the most recent one)
//     const payment = await Payments.find({ userId })
//       .sort({ receivingDate: -1 })
//       .exec();

//     if (!payment) {
//       return res.status(404).json({ message: "No payment found for this user" });
//     }

//     // Find the corresponding order
//     const order = await OrderModel.findOne({ orderId: payment.orderId });

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     // Create a new PDF document
//     const doc = new PDFDocument();
    
//     // Set response headers
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=invoice_${userId}.pdf`);

//     // Pipe the PDF to the response
//     doc.pipe(res);

//     // Add content to the PDF
//     doc.fontSize(20).text('Invoice', { align: 'center' });
//     doc.moveDown();
    
//     // Invoice details
//     doc.fontSize(14).text(`Invoice Number: ${payment.orderId}`);
//     doc.text(`Date: ${payment.receivingDate.toLocaleDateString()}`);
//     doc.text(`Customer ID: ${userId}`);
//     doc.moveDown();
    
//     // Customer information
//     doc.fontSize(16).text('Customer Information:');
//     doc.fontSize(12).text(`Name: ${order.FirstName}`);
//     doc.text(`Email: ${order.email}`);
//     doc.text(`Phone: ${order.phone}`);
//     doc.text(`Address: ${order.address}, ${order.city}, ${order.state} ${order.postCode}`);
//     doc.moveDown();
    
//     // Payment information
//     doc.fontSize(16).text('Payment Details:');
//     doc.fontSize(12).text(`Payment Mode: ${payment.paymentMode}`);
//     if (payment.paymentMode === 'Cheque') {
//       doc.text(`Cheque Number: ${payment.chequeNumber}`);
//     }
//     doc.text(`Amount: ₹${payment.amount.toFixed(2)}`);
//     doc.text(`Status: ${payment.status}`);
//     doc.moveDown();
    
//     // Order items
//     doc.fontSize(16).text('Order Items:');
//     order.cartItems.forEach(item => {
//       doc.fontSize(12).text(`${item.name} - Quantity: ${item.quantity} - Price: ₹${item.price}`);
//     });
//     doc.moveDown();
    
//     // Total
//     doc.fontSize(16).text(`Total: ₹${payment.amount.toFixed(2)}`, { align: 'right' });
    
//     // Finalize the PDF
//     doc.end();

//   } catch (error) {
//     console.error('Error generating invoice:', error);
//     if (error.response?.status === 404) {
//       return res.status(404).json({ message: "Invoice not found for this order" });
//     }
//     res.status(500).json({ message: "Failed to generate invoice", error: error.message });
//   }
// });




// module.exports = router;



const router = require("express").Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const OrderModel = require("../models/PaymentModule");
const Payments = require("../models/payment.modal");
const Product = require("../models/product.model");
const mongoose = require("mongoose");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Map frontend payment modes to backend
const paymentModeMap = {
  payment1: "Online Transfer", // Direct Bank Transfer
  payment2: "Cheque", // Check Payments
  payment3: "Cash", // Cash on Delivery
};

// Create Razorpay Order
router.post("/orders", async (req, res) => {
  try {
    const {
      amount,
      productname,
      cartItems,
      FirstName,
      address,
      email,
      id,
      phone,
      city,
      state,
      postCode,
      paymentMode,
      chequeNumber,
    } = req.body;

    // Validate required fields
    if (
      !amount ||
      isNaN(amount) ||
      !cartItems ||
      !Array.isArray(cartItems) ||
      cartItems.length === 0 ||
      !FirstName ||
      !address ||
      !email ||
      !phone ||
      !city ||
      !state ||
      !paymentMode
    ) {
      return res.status(400).json({ message: "Missing or invalid fields required" });
    }

    // Validate payment mode
    const mappedPaymentMode = paymentModeMap[paymentMode];
    if (!mappedPaymentMode) {
      return res.status(400).json({ message: "Invalid payment mode" });
    }

    // Validate chequeNumber for cheque payments
    if (mappedPaymentMode === "Cheque" && !chequeNumber) {
      return res.status(400).json({ message: "Cheque number required for cheque payments" });
    }

    // Validate stock availability
    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.name}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${item.name}` });
      }
    }

    let order;

    if (mappedPaymentMode === "Online Transfer") {
      // Create Razorpay order for online payments
      const instance = new Razorpay({
        key_id: process.env.KEY_ID,
        key_secret: process.env.KEY_SECRET,
      });

      const options = {
        amount: amount * 100, // Convert to paise
        currency: "INR",
        receipt: crypto.randomBytes(10).toString("hex"),
      };

      order = await new Promise((resolve, reject) => {
        instance.orders.create(options, (error, order) => {
          if (error) {
            reject(error);
          } else {
            resolve(order);
          }
        });
      });
    } else {
      // Mock order ID for cash/cheque
      order = { id: `manual-${crypto.randomBytes(10).toString("hex")}` };
    }

    // Save order details
    await OrderModel.create({
      orderId: order.id,
      amount,
      productname,
      cartItems,
      userId: id,
      FirstName,
      address,
      email,
      phone,
      city,
      state,
      postCode,
      paymentMode: mappedPaymentMode,
      status: "Pending",
    });

    // Save payment details
    await Payments.create({
      amount,
      paymentMode: mappedPaymentMode,
      chequeNumber: mappedPaymentMode === "Cheque" ? chequeNumber : undefined,
      receivingDate: new Date(),
      productname,
      status: "Pending",
      userId: id,
      orderId: order.id,
      remark: productname,
    });

    res.status(200).json({ data: order });
  } catch (error) {
    console.error("Error in /orders:", error);
    res.status(500).json({ message: "Internal Server Error!", error: error.message });
  }
});

// Verify Payment (online only)
router.post("/verify", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Validate request body
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Missing required fields!",
        error: "Required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature",
      });
    }

    const generated_signature = crypto
      .createHmac("sha256", process.env.KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      // Find order
      const order = await OrderModel.findOne({ orderId: razorpay_order_id }).session(session);
      if (!order) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      // Update stock for online payments
      if (order.paymentMode === "Online Transfer") {
        for (const item of order.cartItems) {
          const product = await Product.findById(item.productId).session(session);
          if (!product) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: `Product not found: ${item.name}` });
          }
          if (product.stock < item.quantity) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: `Insufficient stock for product: ${item.name}` });
          }
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: -item.quantity } },
            { new: true, session }
          );
        }
      }

      // Update order status
      await OrderModel.findOneAndUpdate(
        { orderId: razorpay_order_id },
        {
          status: "Completed",
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
        },
        { session }
      );

      // Update payment status
      await Payments.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: "Completed" },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
    } else {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({
        success: false,
        message: "Payment verification failed",
        error: "Invalid signature",
      });
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in /verify:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error!",
      error: error.message,
    });
  }
});

// Confirm Order (cash/cheque)
router.post("/confirm-order", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { orderId } = req.body;

    if (!orderId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Missing orderId" });
    }

    const order = await OrderModel.findOne({ orderId }).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "Completed") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Order already completed" });
    }

    // Update stock for cash/cheque
    if (order.paymentMode === "Cash" || order.paymentMode === "Cheque") {
      for (const item of order.cartItems) {
        const product = await Product.findById(item.productId).session(session);
        if (!product) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({ message: `Product not found: ${item.name}` });
        }
        if (product.stock < item.quantity) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ message: `Insufficient stock for product: ${item.name}` });
        }
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } },
          { new: true, session }
        );
      }
    }

    // Update order and payment status
    await OrderModel.findOneAndUpdate({ orderId }, { status: "Completed" }, { session });
    await Payments.findOneAndUpdate({ orderId }, { status: "Completed" }, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: "Order confirmed successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in /confirm-order:", error);
    res.status(500).json({ message: "Internal Server Error!", error: error.message });
  }
});

// Fetch Payments by User ID
router.get("/payments/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const payments = await Payments.find({ userId })
      .select("productname orderId amount paymentMode status receivingDate remark")
      .sort({ receivingDate: -1 });

    if (!payments || payments.length === 0) {
      return res.status(404).json({ message: "No payments found for this user" });
    }

    res.status(200).json({ data: payments });
  } catch (error) {
    console.error("Error in /payments/:userId:", error);
    res.status(500).json({ message: "Internal Server Error!", error: error.message });
  }
});

// Download Invoice
router.get("/downloadinvoice/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    // Find the payment for this order
    const payment = await Payments.findOne({ orderId });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found for this order" });
    }

    // Find the corresponding order
    const order = await OrderModel.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Create a new PDF document
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${orderId}.pdf`);

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add content to the PDF
    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();
    
    // Invoice details
    doc.fontSize(14).text(`Invoice Number: ${orderId}`);
    doc.text(`Date: ${payment.receivingDate.toLocaleDateString()}`);
    doc.text(`Customer ID: ${order.userId}`);
    doc.moveDown();
    
    // Customer information
    doc.fontSize(16).text('Customer Information:');
    doc.fontSize(12).text(`Name: ${order.FirstName}`);
    doc.text(`Email: ${order.email}`);
    doc.text(`Phone: ${order.phone}`);
    doc.text(`Address: ${order.address}, ${order.city}, ${order.state} ${order.postCode}`);
    doc.moveDown();
    
    // Payment information
    doc.fontSize(16).text('Payment Details:');
    doc.fontSize(12).text(`Payment Mode: ${payment.paymentMode}`);
    if (payment.paymentMode === 'Cheque') {
      doc.text(`Cheque Number: ${payment.chequeNumber || 'N/A'}`);
    }
    doc.text(`Amount: ₹${payment.amount.toFixed(2)}`);
    doc.text(`Status: ${payment.status}`);
    doc.moveDown();
    
    // Order items
    doc.fontSize(16).text('Order Items:');
    order.cartItems.forEach(item => {
      doc.fontSize(12).text(`${item.name} - Quantity: ${item.quantity} - Price: ₹${item.price}`);
    });
    doc.moveDown();
    
    // Total
    doc.fontSize(16).text(`Total: ₹${payment.amount.toFixed(2)}`, { align: 'right' });
    
    // Finalize the PDF
    doc.end();

  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ 
      message: "Failed to generate invoice", 
      error: error.message 
    });
  }
});

module.exports = router;