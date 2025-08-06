
import { useState } from 'react';
import axios from 'axios';

const PaymentForm = ({ orderId, totalAmount, dueAmount, onPaymentSuccess }) => {
  const [formData, setFormData] = useState({
    amount: '',
    receivingDate: '',
    paymentMode: 'Online Transfer',
    chequeNumber: '',
    remark: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate amount
    if (!formData.amount) {
      setError('Please enter a valid amount');
      return;
    }

    if (formData.amount > dueAmount) {
      setError(`Amount cannot exceed due amount (₹${dueAmount})`);
      return;
    }

    // Validate cheque number if payment mode is Cheque
    if (formData.paymentMode === 'Cheque' && !formData.chequeNumber) {
      setError('Cheque number is required for cheque payments');
      return;
    }

    try {
      const paymentData = {
        ...formData,
        orderId,
      };
      
      // Don't send chequeNumber if payment mode isn't Cheque
      if (formData.paymentMode !== 'Cheque') {
        delete paymentData.chequeNumber;
      }

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/payments`, paymentData);

      onPaymentSuccess(res.data.payment);
      setFormData({
        amount: '',
        receivingDate: '',
        paymentMode: 'Online Transfer',
        chequeNumber: '',
        remark: '',
      });
    } catch (err) {
      console.error('Error submitting payment:', err);
      setError('Failed to submit payment. Please try again.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-semibold mb-4">Add Payment</h2>
      <p className="text-sm text-gray-600 mb-4">Balance Due: ₹{dueAmount.toLocaleString()}</p>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter Amount"
              required
              max={dueAmount+1}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receiving Date</label>
            <input
              type="date"
              name="receivingDate"
              value={formData.receivingDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
            <select
              name="paymentMode"
              value={formData.paymentMode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="Online Transfer">Online Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
        </div>

        {/* Cheque Number Field (only shown when payment mode is Cheque) */}
        {formData.paymentMode === 'Cheque' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cheque Number</label>
            <input
              type="text"
              name="chequeNumber"
              value={formData.chequeNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter cheque number"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
          <textarea
            name="remark"
            value={formData.remark}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter remark..."
            rows="2"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Submit Payment
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;