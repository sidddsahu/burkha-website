const express = require('express');
const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  CancelledOrder,
  DilveredOrder,
  shipOrder,
  getDeliveredOrders,
  getShippedOrders,
  getCancelledOrders,
  getOrdersWithDueAmount,
   getMemberById 
} = require('../controllers/order.controller');

const router = express.Router();

router.post('/', createOrder);
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);
router.put('/:id/deliver', DilveredOrder);
router.put('/:id/cancel', CancelledOrder);
router.put('/:id/ship', shipOrder);
router.get('/status/delivered', getDeliveredOrders);
router.get('/status/shipped', getShippedOrders);
router.get('/status/cancelled', getCancelledOrders);
router.get('/dueAmount/:hasDueAmount', getOrdersWithDueAmount);
router.get("/member/:id", getMemberById)

module.exports = router;