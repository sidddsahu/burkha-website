import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ShipOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { order } = location.state || {};

  const [shippingDetails, setShippingDetails] = useState({
    remark: '',
    shippingDate: new Date().toISOString().split('T')[0], // Default to today's date
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!shippingDetails.remark) {
      setError('Please provide shipping remarks');
      setLoading(false);
      toast.error('Please provide shipping remarks');
      return;
    }

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/order/${id}/ship`, {
        remark: shippingDetails.remark,
        shippingDate: shippingDetails.shippingDate,
      });
      toast.success(`Order #${id.slice(-6).toUpperCase()} shipped successfully!`);
      navigate('/orders');
    } catch (err) {
      console.error('Failed to ship order:', err);
      const errorMessage = err.response?.data?.message || 'Failed to ship order';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Ship Order #{id.slice(-6).toUpperCase()}
      </h2>

      {order ? (
        <div className="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
          <p className="font-semibold text-gray-700">
            Vendor: {order.orderItems[0]?.discountName?.firmName || 'N/A'}
          </p>
          <p className="text-gray-600">
            Total: ₹{(order.totalPriceAfterDiscount || order.totalPrice || 0).toFixed(2)}
          </p>
        </div>
      ) : (
        <p className="text-red-500 mb-4">Order details not available</p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-medium" htmlFor="shippingDate">
            Shipping Date
          </label>
          <input
            type="date"
            id="shippingDate"
            name="shippingDate"
            value={shippingDetails.shippingDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-medium" htmlFor="remark">
            Shipping Remarks
          </label>
          <textarea
            id="remark"
            name="remark"
            value={shippingDetails.remark}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Additional shipping notes"
            required
          />
        </div>

        {error && (
          <p className="text-red-500 mb-4 text-sm font-medium">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              'Confirm Shipment'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShipOrder;