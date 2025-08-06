

import { useState, useEffect } from "react";
import { useCart } from "../CartContext";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { ToastContainer, toast } from 'react-toastify';

import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  AlertCircle,
  CreditCard,
  X,
  Check,
  Loader2
} from "lucide-react";

const CartPage = () => {
  const { cart, fetchCart } = useCart();
  const [editedQuantities, setEditedQuantities] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [itemsBeingDeleted, setItemsBeingDeleted] = useState({});
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [discount, setDiscount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [checkoutDone, setCheckoutDone] = useState(false);

  useEffect(() => {
    const initial = {};
    cart.forEach(item => {
      if (item.product) {
        initial[item._id] = item.quantity;
      }
    });
    setEditedQuantities(initial);
  }, [cart]);

  console.log(vendors,'aaaaaaaaaaaaaaaaaaaaaaaaaaa')

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/user`);
        setVendors(res.data);
      } catch {
        setError("Failed to load vendors.");
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  useEffect(() => {
    const vendor = vendors.find(v => v._id === selectedVendor);
    setDiscount(vendor?.discount || 0);
  }, [selectedVendor, vendors]);

  const calculateTotal = () => {
    const subtotal = cart.reduce(
      (sum, item) =>
        item.product
          ? sum + item.product.price * (editedQuantities[item._id] || 1)
          : sum,
      0
    );
    const discAmt = (subtotal * discount) / 100;
    return { subtotal, discount: discAmt, total: subtotal - discAmt };
  };

  const { subtotal, discount: discountAmount, total } = calculateTotal();

  const generatePDF = () => {
    const doc = new jsPDF();
    const vendor = vendors.find(v => v._id === selectedVendor);
    
    // Add header
    doc.setFontSize(18);
    doc.text("Invoice", 10, 10);
    
    // Add vendor details
    doc.setFontSize(12);
    doc.text("Vendor Details:", 10, 20);
    doc.setFontSize(10);
    doc.text(vendor?.firmName || "N/A", 10, 28);
    doc.text(vendor?.contactName || "N/A", 10, 34);
    doc.text(vendor?.email || "N/A", 10, 40);
    doc.text(`${vendor?.address || ""}, ${vendor?.city || ""}, ${vendor?.state || ""}`, 10, 46);

    const cols = ["Product", "Price", "Qty", "Subtotal"];
    const rows = cart
      .filter(item => item.product)
      .map(item => [
        item.product.name,
        `₹${item.product.price}`,
        editedQuantities[item._id],
        `₹${(item.product.price * editedQuantities[item._id]).toFixed(2)}`
      ]);

    autoTable(doc, { 
      head: [cols], 
      body: rows, 
      startY: 54,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    const startY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Subtotal: ₹${subtotal.toFixed(2)}`, 10, startY);
    doc.text(
      `Discount (${discount}%): ₹${discountAmount.toFixed(2)}`,
      10,
      startY + 8
    );
    doc.setFontSize(12);
    doc.text(`Total: ₹${total.toFixed(2)}`, 10, startY + 18);
    doc.save(`invoice-${Date.now()}.pdf`);
  };

  const handleQuantityChange = (id, qty) => {
    const item = cart.find(item => item._id === id);
    if (!item.product || qty < 1 || qty > item.product.stock) {
      return;
    }
    setEditedQuantities(prev => ({ ...prev, [id]: qty }));
  };

  const handleDelete = async id => {
    setItemsBeingDeleted(prev => ({ ...prev, [id]: true }));
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/cart/remove/${id}`);
      await fetchCart();
      
    } catch {
      setError("Failed to delete item. Please try again.");
    } finally {
      setItemsBeingDeleted(prev => ({ ...prev, [id]: false }));
    }
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => {
    setModalOpen(false);
    setPaymentSuccess(false);
  };

  const handlePayment = async () => {
    setProcessingPayment(true);
    setError(null);

    const vendor = vendors.find(v => v._id === selectedVendor);
    
    const payload = {
      orderItems: cart
        .filter(item => item.product)
        .map(item => ({
          productId: item.product._id,
          productName: item.product.name,
          price: item.product.price,
          quantity: editedQuantities[item._id],
          productImage: item.product.images[0] || "",
          discountName: {
            _id: vendor?._id || "",
            firmName: vendor?.firmName || "",
            contactName: vendor?.contactName || "",
            mobile1: vendor?.mobile1 || "",
            mobile2: vendor?.mobile2 || "",
            whatsapp: vendor?.whatsapp || "",
            email: vendor?.email || "",
            address: vendor?.address || "",
            city: vendor?.city || "",
            state: vendor?.state || "",
            limit: vendor?.limit || "",

            discount: vendor?.discount || 0
          },
          discountPercentage: discount,
          priceAfterDiscount:
            item.product.price - (item.product.price * discount) / 100
        })),
      totalPrice: subtotal,
      totalPriceAfterDiscount: total,
      vendor: selectedVendor
    };

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/order`, payload);

      if (res.data.success) {
        setPaymentSuccess(true);
        await fetchCart();
        setTimeout(() => {
          closeModal();
          setCheckoutDone(true);
        }, 1000);
      } else {
        setError("Order creation failed. Please try again.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.response?.data?.message || "you cross the limit.");
      toast.error("You cross the limit");
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-2 mb-6">
        <ShoppingCart className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">Your Shopping Cart</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {cart.filter(item => item.product).length === 0 ? (
        <div className="border border-gray-200 rounded-lg shadow-sm flex flex-col items-center py-12 bg-white">
          <ShoppingCart className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-lg text-gray-500 mb-2">Your cart is empty</p>
          <p className="text-gray-400 text-sm mb-4">Add some products to get started</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item =>
              item.product && (
                <div
                  key={item._id}
                  className="border border-gray-200 rounded-lg shadow-sm p-4 bg-white flex gap-4"
                >
                  <div className="flex-shrink-0">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-24 w-24 object-cover rounded-md"
                      />
                    ) : (
                      <div className="h-24 w-24 bg-gray-100 flex items-center justify-center rounded-md">
                        <ShoppingCart className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <h2 className="font-medium text-gray-800">{item.product.name}</h2>
                      <button
                        onClick={() => handleDelete(item._id)}
                        disabled={itemsBeingDeleted[item._id]}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        {itemsBeingDeleted[item._id] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    
                    <p className="text-gray-600 text-sm mt-1">₹{item.product.price} each</p>
                    <p className={`text-sm mt-1 ${item.product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.product.stock > 0 ? `${item.product.stock} available` : "Out of stock"}
                    </p>
                    
                    <div className="mt-3 flex items-center">
                      <button style={{color:"black"}}
                        onClick={() => handleQuantityChange(item._id, (editedQuantities[item._id] || 1) - 1)}
                        disabled={(editedQuantities[item._id] || 1) <= 1}
                        className=" text-black items-center justify-center border border-gray-300 rounded-r-md bg-gray-50 disabled:opacity-50"
                      >
                        <Minus style={{color:"black !important"}} className="h-3 w-3 text-black" />
                      </button>
                      <input
                        type="number"
                        value={editedQuantities[item._id] || 1}
                        onChange={e => {
                          const value = parseInt(e.target.value, 10);
                          handleQuantityChange(
                            item._id,
                            isNaN(value) || value < 1 ? 1 : value
                          );
                        }}
                        min="1"
                        max={item.product.stock}
                        className="h-8 w-12 text-center border-t border-b border-gray-300"
                      />
                      <button
                        onClick={() => handleQuantityChange(item._id, (editedQuantities[item._id] || 1) + 1)}
                        disabled={(editedQuantities[item._id] || 1) >= item.product.stock}
                        className=" text-black items-center justify-center border border-gray-300 rounded-r-md bg-gray-50 disabled:opacity-50"
                      >
                        <Plus className="h-5 w-3 text-black" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 flex flex-col items-end">
                    <p className="font-medium text-gray-800">
                      ₹{(item.product.price * (editedQuantities[item._id] || 1)).toFixed(2)}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
          
          <div className="lg:col-span-1">
            <div className="border border-gray-200 rounded-lg shadow-sm p-4 bg-white">
              <h3 className="font-medium text-lg text-gray-800 mb-4">Order Summary</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Vendor</label>
                <select
                  value={selectedVendor}
                  onChange={e => setSelectedVendor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a vendor</option>
                  {vendors.map(v => (
                    <option key={v._id} value={v._id}>
                      {v.firmName} ({v.contactName})
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedVendor && (
                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Discount Applied:</span> {discount}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {vendors.find(v => v._id === selectedVendor)?.firmName}
                  </p>
                </div>
              )}
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800">₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-green-600">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 my-2"></div>
                <div className="flex justify-between font-medium text-lg">
                  <span className="text-gray-800">Total</span>
                  <span className="text-gray-800">₹{total.toFixed(2)}</span>
                </div>
              </div>
              
              {!checkoutDone ? (
                <button
                  onClick={openModal}
                  disabled={!selectedVendor}
                  className={`w-full py-2 rounded-md flex items-center justify-center transition-colors ${
                    !selectedVendor
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Checkout
                </button>
              ) : (
                <button
                  onClick={generatePDF}
                  className="w-full py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  Download Invoice
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Confirm Your Order
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {cart
                .filter(item => item.product)
                .map(item => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.product.name} × {editedQuantities[item._id]}
                    </span>
                    <span className="text-gray-800">
                      ₹{(item.product.price * editedQuantities[item._id]).toFixed(2)}
                    </span>
                  </div>
                ))}
            </div>

            <div className="border-t border-gray-200 my-3"></div>

            {discount > 0 && (
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-600">
                  Discount ({discount}%)
                </span>
                <span className="text-green-600">
                  -₹{discountAmount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between font-medium text-lg mt-3">
              <span>Total Amount</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={processingPayment}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={processingPayment || paymentSuccess}
                className={`px-4 py-2 rounded-md text-white flex items-center justify-center transition-colors ${
                  processingPayment
                    ? "bg-blue-400 cursor-not-allowed"
                    : paymentSuccess
                    ? "bg-green-500"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : paymentSuccess ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Order Placed
                  </>
                ) : (
                  "Place Order"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default CartPage;