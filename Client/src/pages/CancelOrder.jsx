import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const CancelOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { order } = location.state || {};
  
  const [cancelDetails, setCancelDetails] = useState({
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCancelDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!cancelDetails.reason) {
      setError('Please provide a cancellation reason');
      setLoading(false);
      return;
    }

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/order/${id}/cancel`, {
        cancelDetails
      });
      navigate('/orders', { state: { message: 'Order cancelled successfully' } });
    } catch (err) {
      console.error('Failed to cancel order:', err);
      setError(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Cancel Order #{id.slice(-6).toUpperCase()}</h2>
      
      {order && (
        <div className="mb-4">
          <p className="font-semibold">Customer: {order.user?.name || 'Guest'}</p>
          <p>Total: ₹{order.totalPriceAfterDiscount || order.totalPrice}</p>
          <p className="text-red-500 font-semibold">This action cannot be undone</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="reason">
            Cancellation Reason
          </label>
          <textarea
            id="reason"
            name="reason"
            value={cancelDetails.reason}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            rows="3"
            placeholder="Please provide detailed reason for cancellation"
            required
          />
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            disabled={loading}
          >
            Back to Orders
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm Cancellation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CancelOrder;