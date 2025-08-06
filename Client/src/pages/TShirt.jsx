import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import TShirtForm from './TShirtForm';
import TShirtPrint from './TShirtPrint';

const TShirtList = () => {
  const [tshirts, setTshirts] = useState([]);
  const [editingTShirt, setEditingTShirt] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [printTShirt, setPrintTShirt] = useState(null);
  const printRef = React.useRef();

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  useEffect(() => {
    fetchTShirts();
  }, []);

  const fetchTShirts = async () => {
    try {
      const response = await axios.get('/api/tshirts');
      setTshirts(response.data);
    } catch (error) {
      console.error('Error fetching t-shirts:', error);
    }
  };

  const handleEdit = (tshirt) => {
    setEditingTShirt(tshirt);
    setShowForm(true);
  };

  const handlePrintClick = (tshirt) => {
    setPrintTShirt(tshirt);
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/tshirts/${id}`);
      fetchTShirts();
    } catch (error) {
      console.error('Error deleting t-shirt:', error);
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingTShirt(null);
    fetchTShirts();
  };

  return (
    <div className="container mx-auto p-4">
      {printTShirt && (
        <div className="hidden">
          <TShirtPrint ref={printRef} tshirt={printTShirt} />
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">T-Shirt Inventory</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New T-Shirt
        </button>
      </div>

      {showForm && (
        <TShirtForm
          tshirt={editingTShirt}
          onSave={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingTShirt(null);
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tshirts.map(tshirt => (
          <div key={tshirt._id} className="border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between">
              <h2 className="font-bold text-lg">{tshirt.itemName}</h2>
              <span className="font-bold">₹{tshirt.mrp}</span>
            </div>
            <div className="my-2">
              <p><span className="text-gray-600">Size:</span> {tshirt.size}</p>
              <p><span className="text-gray-600">Color:</span> {tshirt.color}</p>
              <p><span className="text-gray-600">Qty:</span> {tshirt.quantity}</p>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => handlePrintClick(tshirt)}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm"
              >
                Print
              </button>
              <button
                onClick={() => handleEdit(tshirt)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(tshirt._id)}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TShirtList;