const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const Product = require('../models/product.model');
const Vendor = require('../models/RegistrationModel');
const Cart = require('../models/cart.model');

const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, totalPrice, totalPriceAfterDiscount, vendor } = req.body;

  if (
    !orderItems ||
    !Array.isArray(orderItems) ||
    orderItems.length === 0 ||
    totalPrice === undefined ||
    totalPriceAfterDiscount === undefined ||
    !vendor
  ) {
    res.status(400);
    throw new Error('Missing required fields: orderItems, totalPrice, totalPriceAfterDiscount, or vendor');
  }

  // ✅ First, fetch the vendor data
  const vendorData = await Vendor.findById(vendor);
  if (!vendorData) {
    res.status(404);
    throw new Error(`Vendor not found: ${vendor}`);
  }

  // ✅ Then, get all previous orders of that vendor
  const orders = await Order.find({ vendor }).sort({ createdAt: -1 });

  // ✅ Calculate the total due amount
  const totalDueAmount = orders.reduce((acc, order) => acc + (order.dueAmount || 0), 0);
  console.log(totalDueAmount,)

  // ✅ Check if limit will be exceeded by this new order
  const newTotalDue = totalDueAmount + totalPriceAfterDiscount;
  const isLimitExceeded = newTotalDue > (vendorData.limit || 0);

  if (isLimitExceeded) {
    res.status(400);
    throw new Error(`Vendor limit exceeded. Current due: ${totalDueAmount}, new order: ${totalPriceAfterDiscount}, limit: ${vendorData.limit}`);
  }

  // 🔁 Validate order items and stock (your original loop stays the same)
  for (const item of orderItems) {
    if (
      !item.productId ||
      !item.productName ||
      item.price === undefined ||
      item.quantity === undefined ||
      item.discountPercentage === undefined ||
      item.priceAfterDiscount === undefined
    ) {
      res.status(400);
      throw new Error('Each order item must include productId, productName, price, quantity, discountPercentage, and priceAfterDiscount');
    }

    const product = await Product.findById(item.productId);
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.productName}`);
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${item.productName}. Only ${product.stock} available.`);
    }
  }

  // ✅ Create the order (rest of your logic continues as before)
  const order = new Order({
    orderItems: orderItems.map(item => ({
      ...item,
      discountName: {
        _id: vendorData._id,
        firmName: vendorData.firmName,
        contactName: vendorData.contactName,
        mobile1: vendorData.mobile1,
        mobile2: vendorData.mobile2,
        whatsapp: vendorData.whatsapp,
        email: vendorData.email,
        address: vendorData.address,
        limit: vendorData.limit,
        city: vendorData.city,
        state: vendorData.state,
        discount: vendorData.discount
      }
    })),
    totalPrice,
    totalPriceAfterDiscount,
    dueAmount: totalPriceAfterDiscount,
    paymentStatus: 'pending',
    status: 'pending',
    vendor
  });

  const savedOrder = await order.save();

  // Update stock
  for (const item of orderItems) {
    const product = await Product.findById(item.productId);
    product.stock -= item.quantity;
    await product.save();
  }

  // Clear cart
  let cart = await Cart.findOne();
  if (cart) {
    cart.products = [];
    await cart.save();
  }

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    order: savedOrder
  });
});

// Get all orders
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    orders
  });
});

// Get a single order by ID
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  res.status(200).json({
    success: true,
    order
  });
});

// Update an order
const updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const { status, ...otherUpdates } = req.body;
  if (status) {
    order.status = status;
  }
  Object.assign(order, otherUpdates);

  const updatedOrder = await order.save();
  res.status(200).json({
    success: true,
    message: 'Order updated successfully',
    order: updatedOrder
  });
});

// Delete an order
const deleteOrder = asyncHandler(async (req, res) => {
  const deletedOrder = await Order.findByIdAndDelete(req.params.id);
  if (!deletedOrder) {
    res.status(404);
    throw new Error('Order not found');
  }
  res.status(200).json({
    success: true,
    message: 'Order deleted successfully',
    order: deletedOrder
  });
});

// Ship an order
const shipOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { remark, shippingDate } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.status !== 'pending' && order.status !== 'confirmed') {
    res.status(400);
    throw new Error(`Order cannot be shipped from current status: ${order.status}`);
  }

  order.status = 'shipped';
  order.shippingDetails = {
    remark: remark || '',
    shippedAt: shippingDate || new Date()
  };

  const updatedOrder = await order.save();
  res.status(200).json({
    success: true,
    message: 'Order shipped successfully',
    order: updatedOrder
  });
});

// Deliver an order
const DilveredOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { deliveryDetails } = req.body;

  if (!deliveryDetails || !deliveryDetails.receivedBy || !deliveryDetails.remark) {
    res.status(400);
    throw new Error('Please provide delivery details including receivedBy and remark');
  }

  const order = await Order.findById(id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.status === 'delivered') {
    res.status(400);
    throw new Error('Order is already delivered');
  }

  order.status = 'delivered';
  order.deliveryDetails = {
    receivedBy: deliveryDetails.receivedBy,
    remark: deliveryDetails.remark,
    deliveredAt: new Date()
  };

  const updatedOrder = await order.save();
  res.status(200).json({
    success: true,
    message: 'Order marked as delivered successfully',
    order: updatedOrder
  });
});

// Cancel an order
const CancelledOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = 'cancelled';
  order.cancellationReason = req.body.reason;
  const updatedOrder = await order.save();

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    order: updatedOrder
  });
});

// Get all delivered orders
const getDeliveredOrders = asyncHandler(async (req, res) => {
  const deliveredOrders = await Order.find({ status: 'delivered' })
    .sort({ 'deliveryDetails.deliveredAt': -1 });
  res.status(200).json({
    success: true,
    count: deliveredOrders.length,
    orders: deliveredOrders
  });
});

// Get all shipped orders
const getShippedOrders = asyncHandler(async (req, res) => {
  const shippedOrders = await Order.find({ status: 'shipped' })
    .sort({ 'shippingDetails.shippedAt': -1 });
  res.status(200).json({
    success: true,
    orders: shippedOrders
  });
});

// Get all cancelled orders
const getCancelledOrders = asyncHandler(async (req, res) => {
  const cancelledOrders = await Order.find({ status: 'cancelled' })
    .sort({ updatedAt: -1 });
  res.status(200).json({
    success: true,
    orders: cancelledOrders
  });
});

// Get orders with due amount
const getOrdersWithDueAmount = asyncHandler(async (req, res) => {
  const hasDueAmount = req.params.hasDueAmount === 'true';
  const query = hasDueAmount ? { dueAmount: { $gt: 0 } } : {};
  const orders = await Order.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    count: orders.length,
    orders: orders.map(order => ({
      ...order._doc,
      formattedId: `ORD-${order._id.toString().substring(0, 8).toUpperCase()}`
    }))
  });
});


const getMemberById = async (req, res) => {
  try {
    const order = await Vendor.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.log(error.message)
  }
};


module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  DilveredOrder,
  shipOrder,
  CancelledOrder,
  getDeliveredOrders,
  getShippedOrders,
  getCancelledOrders,
  getOrdersWithDueAmount,
  getMemberById
};