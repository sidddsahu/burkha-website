

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import {QRCode} from 'qrcode.react';

const ProductForm = ({ product, onSubmit }) => {
  const [formData, setFormData] = useState(product || {
    name: '',
    barcode: '',
    price: '',
    description: '',
    color: '',
    fabric: '',
    size: [''],
    quantity: [0],
    images: ['']
  });
  
  const [qrCodeData, setQrCodeData] = useState('');
  const [showQR, setShowQR] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayField = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], field === 'quantity' ? 0 : ''] });
  };

  const removeArrayField = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const generateQRCode = () => {
    const data = {
      name: formData.name,
      barcode: formData.barcode,
      price: formData.price,
      description: formData.description
    };
    setQrCodeData(JSON.stringify(data));
    setShowQR(true);
  };

  const printProductDetails = () => {
    const printContent = `
      <div class="p-4 max-w-md mx-auto">
        <h1 class="text-2xl font-bold mb-4">${formData.name}</h1>
        <div class="mb-4">
          <img src="${formData.images[0] || ''}" alt="${formData.name}" class="w-full h-auto rounded-lg">
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p class="font-semibold">Price:</p>
            <p>$${formData.price}</p>
          </div>
          <div>
            <p class="font-semibold">Color:</p>
            <p>${formData.color}</p>
          </div>
          <div>
            <p class="font-semibold">Fabric:</p>
            <p>${formData.fabric}</p>
          </div>
        </div>
        <div class="mb-4">
          <h2 class="text-lg font-semibold mb-2">Sizes & Quantities</h2>
          <ul class="list-disc pl-5">
            ${formData.size.map((size, index) => `
              <li>${size}: ${formData.quantity[index] || 0} available</li>
            `).join('')}
          </ul>
        </div>
        <div class="mb-4">
          <h2 class="text-lg font-semibold mb-2">Description</h2>
          <p>${formData.description}</p>
        </div>
        ${qrCodeData ? `
        <div class="mt-6 flex flex-col items-center">
          <h2 class="text-lg font-semibold mb-2">Product QR Code</h2>
          <div class="p-2 border border-gray-300 rounded">
            <QRCode value="${qrCodeData}" size={128} />
          </div>
        </div>
        ` : ''}
      </div>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${formData.name} - Product Details</title>
          <script src="https://unpkg.com/qrcode.react@1.0.1/dist/qrcode.react.min.js"></script>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body class="p-4">
          ${printContent}
          <div class="no-print mt-6 text-center">
            <button onclick="window.print()" class="bg-blue-500 text-white px-4 py-2 rounded mr-2">Print</button>
            <button onclick="window.close()" class="bg-gray-500 text-white px-4 py-2 rounded">Close</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        {product ? 'Edit Product' : 'Add New Product'}
      </h1>
      
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Product Name*
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                Price ($)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="color">
                Color
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="color"
                name="color"
                type="text"
                value={formData.color}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fabric">
                Fabric
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="fabric"
                name="fabric"
                type="text"
                value={formData.fabric}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Sizes and Quantities */}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Sizes & Quantities
              </label>
              <div className="space-y-2">
                {formData.size.map((size, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Size</label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text"
                        value={size}
                        onChange={(e) => handleArrayChange('size', index, e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="number"
                        value={formData.quantity[index] || 0}
                        onChange={(e) => handleArrayChange('quantity', index, parseInt(e.target.value) || 0)}
                      />
                    </div>
                    {formData.size.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField('size', index)}
                        className="mt-5 bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-sm"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('size')}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm"
                >
                  + Add Size
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Images */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Product Images
            </label>
            <div className="space-y-2">
              {formData.images.map((image, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="text"
                    value={image}
                    onChange={(e) => handleArrayChange('images', index, e.target.value)}
                    placeholder="Image URL"
                  />
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField('images', index)}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-sm"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField('images')}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm"
              >
                + Add Image URL
              </button>
            </div>
            {formData.images[0] && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.images.filter(url => url).map((image, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <img 
                      src={image} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-32 object-cover"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found'}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between mt-8 gap-2">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            type="submit"
          >
            {product ? 'Update Product' : 'Save Product'}
          </button>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={generateQRCode}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              Generate QR
            </button>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>

      {showQR && (
        <div className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Product QR Code</h2>
            <button 
              onClick={() => setShowQR(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg bg-white">
              <QRCode 
                value={qrCodeData} 
                size={256}
                level="H"
                includeMargin={true}
                fgColor="#1e40af"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={printProductDetails}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Print Product Details
              </button>
              <button
                onClick={() => window.print()}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
              >
                Print QR Only
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductForm;