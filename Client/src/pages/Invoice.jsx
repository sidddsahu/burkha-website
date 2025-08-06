

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Invoice = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDueAmountOrders();
  }, []);

  const fetchDueAmountOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/order/dueAmount/${true}`);
      const ordersWithFormattedId = response.data.orders.map(order => ({
        ...order,
        formattedId: `ORD-${order._id.toString().substring(0, 8).toUpperCase()}`
      }));
      setOrders(ordersWithFormattedId);
      toast.success(`Loaded ${ordersWithFormattedId.length} orders with due amount`);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders with due amount');
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = (orderId) => {
    console.log('View order:', orderId);
    toast.info(`Viewing order details for order ${orderId.substring(0, 8)}...`);
    // You can implement navigation to order details page here
  };

  const markAsPaid = async (orderId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/orders/${orderId}/payment`, {
        dueAmount: 0,
        paymentStatus: 'paid'
      });
      toast.success('Order marked as paid successfully');
      fetchDueAmountOrders(); // Refresh the list
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'formattedId',
      key: 'formattedId',
      render: (id) => <span className="font-mono">{id}</span>,
    },
    {
      title: 'Customer',
      dataIndex: ['orderItems', '0', 'discountName', 'firmName'],
      key: 'customer',
      render: (firmName) => <span className="font-medium">{firmName || 'N/A'}</span>,
    },
    {
      title: 'Order Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <span className="text-gray-600">
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalPriceAfterDiscount',
      key: 'total',
      render: (amount) => (
        <span className="font-bold text-blue-600">
          ₹{amount.toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Due Amount',
      dataIndex: 'dueAmount',
      key: 'due',
      render: (amount) => (
        <span className="font-bold text-red-600">
          ₹{amount.toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Payment Status',
      dataIndex: 'paymentStatus',
      key: 'status',
      render: (status) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {status.toUpperCase()}
        </span>
      ),
    }
  ];

  return (
    <div className="max-w-6xl  py-8">
      <div className="bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Pending Payments</h2>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              Total Due: <span className="font-bold">{orders.length}</span> orders
            </span>
            <button
              onClick={fetchDueAmountOrders}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </>
              ) : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                    No orders with pending payments found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    {columns.map((column) => (
                      <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                        {column.render
                          ? column.render(
                              Array.isArray(column.dataIndex) 
                                ? column.dataIndex.reduce((obj, key) => (obj && obj[key]) ? obj[key] : null, order)
                                : order[column.dataIndex], 
                              order
                            )
                          : order[column.dataIndex]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Invoice;