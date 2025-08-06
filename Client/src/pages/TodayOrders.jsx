import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { debounce } from "lodash";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const TodayOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [todaysTotal, setTodaysTotal] = useState({ quantity: 0, price: 0 });
  const [updatingStatus, setUpdatingStatus] = useState({});
  const printRef = useRef();
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/order`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todaysOrders = res.data.orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= today;
      });

      setOrders(todaysOrders);
      setFilteredOrders(todaysOrders);
      calculateTodaysTotals(todaysOrders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateTodaysTotals = (orders) => {
    let totalQuantity = 0;
    let totalPrice = 0;

    orders.forEach((order) => {
      order.orderItems?.forEach((item) => {
        totalQuantity += item.quantity || 0;
        totalPrice += (item.priceAfterDiscount || item.price || 0) * (item.quantity || 0);
      });
    });

    setTodaysTotal({
      quantity: totalQuantity,
      price: totalPrice,
    });
  };

  const fetchPaymentDetails = async (orderId) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/payments/${orderId}`);
      setPaymentDetails(res.data.payments || []);
    } catch (err) {
      console.error("Failed to fetch payment details:", err);
      setPaymentDetails([]);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus((prev) => ({ ...prev, [orderId]: true }));

      const orderToUpdate = orders.find((order) => order._id === orderId);

      if (newStatus === "shipped") {
        navigate(`/ship-order/${orderId}`, {
          state: { order: orderToUpdate },
        });
        return;
      } else if (newStatus === "delivered") {
        navigate(`/deliver-order/${orderId}`, {
          state: { order: orderToUpdate },
        });
        return;
      } else if (newStatus === "cancelled") {
        navigate(`/cancel-order/${orderId}`, {
          state: { order: orderToUpdate },
        });
        return;
      }

      await axios.put(`${import.meta.env.VITE_API_URL}/order/${orderId}`, { status: newStatus });
      await fetchOrders();

      if (selectedOrder?._id === orderId) {
        closeModal();
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Failed to update order status. Please try again.");
    } finally {
      setUpdatingStatus((prev) => ({
        ...prev,
        [orderId]: false,
      }));
    }
  };

  const generatePDF = () => {
    if (!selectedOrder) return;

    const doc = new jsPDF();
    const vendor = selectedOrder.orderItems[0]?.discountName;

    // Header
    doc.setFontSize(18);
    doc.text("Order Invoice", 14, 20);

    // Company Info
    doc.setFontSize(10);
    doc.text("Company Name", 14, 30);
    doc.text("123 Business Street, City", 14, 36);
    doc.text("Phone: (123) 456-7890", 14, 42);

    // Vendor Details
    doc.setFontSize(12);
    doc.text("Vendor Details:", 14, 54);
    doc.setFontSize(10);
    doc.text(vendor?.firmName || "N/A", 14, 62);
    doc.text(vendor?.contactName || "N/A", 14, 68);
    doc.text(vendor?.email || "N/A", 14, 74);
    doc.text(`${vendor?.address || ""}, ${vendor?.city || ""}, ${vendor?.state || ""}`, 14, 80);
    if (vendor?.mobile1) doc.text(`Mobile: ${vendor.mobile1}`, 14, 86);
    if (vendor?.whatsapp) doc.text(`WhatsApp: ${vendor.whatsapp}`, 14, 92);
    if (vendor?.discountPercentage) doc.text(`Discount: ${vendor.discountPercentage}%`, 14, 98);

    // Order Details
    doc.setFontSize(12);
    doc.text(`Order #${selectedOrder._id.slice(-6).toUpperCase()}`, 140, 54);
    doc.setFontSize(10);
    doc.text(`Date: ${new Date(selectedOrder.createdAt).toLocaleDateString()}`, 140, 62);
    doc.text(`Status: ${selectedOrder.status.toUpperCase()}`, 140, 68);
    doc.text(`Payment: ${selectedOrder.paymentStatus.toUpperCase()}`, 140, 74);

    // Items Table
    const cols = ["Product", "Qty", "Price", "Discount %", "Price After Discount", "Total"];
    const rows = selectedOrder.orderItems.map((item) => [
      item.productName,
      item.quantity,
      `₹${item.price.toFixed(2)}`,
      `${item.discountPercentage}%`,
      `₹${item.priceAfterDiscount.toFixed(2)}`,
      `₹${(item.priceAfterDiscount * item.quantity).toFixed(2)}`,
    ]);

    autoTable(doc, {
      head: [cols],
      body: rows,
      startY: 104,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 20 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 },
      },
    });

    // Summary
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Subtotal: ₹${selectedOrder.totalPrice.toFixed(2)}`, 14, finalY);
    if (selectedOrder.totalPriceAfterDiscount) {
      doc.text(`After Discount: ₹${selectedOrder.totalPriceAfterDiscount.toFixed(2)}`, 14, finalY + 6);
    }
    doc.text(`Paid: ₹${selectedOrder.paidAmount || 0}`, 14, finalY + 12);
    doc.text(
      `Due: ₹${selectedOrder.dueAmount || (selectedOrder.totalPriceAfterDiscount ?? selectedOrder.totalPrice) - (selectedOrder.paidAmount || 0)}`,
      14,
      finalY + 18
    );

    // Payment History
    if (paymentDetails.length > 0) {
      finalY += 30;
      doc.setFontSize(12);
      doc.text("Payment History", 14, finalY);
      const paymentCols = ["Date", "Amount", "Method", "Reference"];
      const paymentRows = paymentDetails.map((payment) => [
        new Date(payment.paymentDate).toLocaleDateString(),
        `₹${payment.amount}`,
        payment.paymentMethod,
        payment.referenceNumber || "N/A",
      ]);

      autoTable(doc, {
        head: [paymentCols],
        body: paymentRows,
        startY: finalY + 10,
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
      });
      finalY = doc.lastAutoTable.finalY;
    }

    // Footer
    doc.setFontSize(8);
    doc.text("Thank you for your business!", 14, finalY + 20);
    doc.save(`order-${selectedOrder._id.slice(-6)}.pdf`);
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Order-${selectedOrder?._id.slice(-6).toUpperCase() || "Order"}`,
    pageStyle: `
      @page { size: auto; margin: 5mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .no-print { display: none !important; }
        .print-header { display: block !important; }
        .print-footer { display: block !important; }
        .print-logo { max-width: 150px; margin-bottom: 20px; }
        .print-signature { margin-top: 50px; display: flex; justify-content: space-between; }
        .print-photo { max-width: 200px; margin-top: 20px; }
        .print-table { width: 100%; border-collapse: collapse; }
        .print-table th, .print-table td { border: 1px solid #ddd; padding: 8px; }
        .print-table th { background-color: #f2f2f2; }
      }
    `,
    removeAfterPrint: true,
  });

  const viewOrderDetails = async (order) => {
    setSelectedOrder(order);
    await fetchPaymentDetails(order._id);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setPaymentDetails([]);
  };

  const navigateToPayments = (orderId) => {
    navigate(`/allpayment/${orderId}`);
  };

  const handleSearch = debounce((searchValue) => {
    const result = orders.filter((order) => {
      const searchLower = searchValue.toLowerCase();
      return (
        order._id?.toLowerCase().includes(searchLower) ||
        order.orderItems[0].discountName?.firmName?.toLowerCase().includes(searchLower) ||
        new Date(order.createdAt).toLocaleDateString().toLowerCase().includes(searchLower) ||
        `${order.totalPriceAfterDiscount ?? order.totalPrice}`.toLowerCase().includes(searchLower) ||
        order.status?.toLowerCase().includes(searchLower) ||
        order.paymentStatus?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredOrders(result);
  }, 300);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (search) {
      handleSearch(search);
    } else {
      setFilteredOrders(orders);
    }
    return () => {
      handleSearch.cancel();
    };
  }, [search, orders, handleSearch]);

  const columns = [
    {
      name: "Order ID",
      selector: (row) => row._id.slice(-6).toUpperCase(),
      sortable: true,
      width: "100px",
      cell: (row) => <span className="font-medium text-blue-600">{row._id.slice(-6).toUpperCase()}</span>,
    },
    {
      name: "Time",
      selector: (row) => new Date(row.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      sortable: true,
      width: "90px",
    },
    {
      name: "Vendor",
      selector: (row) => row.orderItems[0].discountName?.firmName,
      sortable: true,
      width: "140px",
      cell: (row) => <span className="font-medium">{row.orderItems[0].discountName?.firmName || "N/A"}</span>,
    },
    {
      name: "Items",
      selector: (row) => row.orderItems?.length || 0,
      sortable: true,
      width: "80px",
      center: true,
    },
    {
      name: "Total",
      selector: (row) => `₹${(row.totalPriceAfterDiscount ?? row.totalPrice)?.toFixed(2)}`,
      sortable: true,
      width: "120px",
      cell: (row) => <span className="font-semibold">₹{(row.totalPriceAfterDiscount ?? row.totalPrice)?.toFixed(2)}</span>,
    },
    {
      name: "Due",
      selector: (row) => `₹${row.dueAmount?.toFixed(2) ?? 0}`,
      sortable: true,
      width: "120px",
      cell: (row) => (
        <span className={`font-semibold ${row.dueAmount > 0 ? "text-red-600" : "text-green-600"}`}>
          ₹{row.dueAmount?.toFixed(2) ?? 0}
        </span>
      ),
    },
    {
      name: "Payment",
      cell: (row) => {
        const paymentStatus = row.paymentStatus || "pending";
        return (
          <span
            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
              ${paymentStatus === "paid" ? "bg-green-100 text-green-800" : 
                paymentStatus === "partially_paid" ? "bg-blue-100 text-blue-800" : 
                "bg-yellow-100 text-yellow-800"}`}
          >
            {paymentStatus.replace("_", " ").toUpperCase()}
          </span>
        );
      },
      width: "120px",
      center: true,
    },
    {
      name: "Status",
      cell: (row) => {
        const status = row.status || "pending";
        return (
          <span
            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
              ${status === "delivered" ? "bg-green-100 text-green-800" : 
                status === "processing" || status === "shipped" ? "bg-blue-100 text-blue-800" : 
                status === "cancelled" ? "bg-red-100 text-red-800" : 
                "bg-yellow-100 text-yellow-800"}`}
          >
            {status.toUpperCase()}
          </span>
        );
      },
      width: "120px",
      center: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex flex-col gap-1">
          <button
            onClick={() => viewOrderDetails(row)}
            className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
            disabled={updatingStatus[row._id]}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View
          </button>
          <select
            value={row.status || "pending"}
            onChange={(e) => updateOrderStatus(row._id, e.target.value)}
            className="px-1 py-1 text-xs border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 bg-white"
            disabled={updatingStatus[row._id]}
          >
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {updatingStatus[row._id] && (
            <span className="text-xs text-gray-500 text-center">Updating...</span>
          )}
          <button
            onClick={() => navigateToPayments(row._id)}
            className={`px-2 py-1 text-xs rounded transition-colors flex items-center justify-center gap-1
              ${row.paymentStatus === "paid" ? "bg-gray-50 text-gray-600 hover:bg-gray-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {row.paymentStatus === "paid" ? "Payments" : "Pay"}
          </button>
        </div>
      ),
      width: "150px",
      center: true,
    },
  ];

  return (
    <div className="max-w-5xl py-8">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Today's Orders</h1>
            <p className="text-gray-500 mt-1">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center gap-2 transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{filteredOrders.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Quantity</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{todaysTotal.quantity}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">₹{todaysTotal.price.toFixed(2)}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div> */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <DataTable
          columns={columns}
          data={filteredOrders}
          progressPending={loading}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 25, 50, 100]}
          highlightOnHover
          striped
          responsive
          noDataComponent={
            <div className="p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No orders today</h3>
              <p className="mt-1 text-gray-500">No orders have been placed yet for today.</p>
              <button
                onClick={fetchOrders}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
                Refresh
              </button>
            </div>
          }
          customStyles={{
            headCells: {
              style: {
                fontWeight: "bold",
                backgroundColor: "#f9fafb",
                color: "#374151",
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                paddingLeft: "1rem",
                paddingRight: "1rem",
              },
            },
            cells: {
              style: {
                paddingTop: "0.75rem",
                paddingBottom: "0.75rem",
                paddingLeft: "1rem",
                paddingRight: "1rem",
              },
            },
            rows: {
              style: {
                "&:not(:last-of-type)": {
                  borderBottom: "1px solid #f3f4f6",
                },
              },
            },
          }}
        />
      </div>
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6" ref={printRef}>
              <div className="print-header hidden mb-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold">Company Name</h1>
                    <p className="text-gray-600">123 Business Street, City</p>
                    <p className="text-gray-600">Phone: (123) 456-7890</p>
                  </div>
                  <div className="print-logo">
                    <div className="bg-gray-200 w-32 h-32 flex items-center justify-center">
                      <span className="text-gray-500">Company Logo</span>
                    </div>
                  </div>
                </div>
                <hr className="my-4 border-t-2 border-gray-300" />
              </div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Order #{selectedOrder._id.slice(-6).toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {/* <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1.5 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                      />
                    </svg>
                    Print
                  </button> */}
                  <button
                    onClick={generatePDF}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1.5 transition-colors"
                    >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Print
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-gray-700 border-b pb-2 mb-3 text-lg">Vendor Details</h4>
                  {selectedOrder.orderItems[0]?.discountName ? (
                    <div className="space-y-3 text-sm">
                      <div className="flex">
                        <span className="font-medium text-gray-600 w-24">Firm Name:</span>
                        <span>{selectedOrder.orderItems[0].discountName.firmName}</span>
                      </div>
                      <div className="flex">
                        <span className="font-medium text-gray-600 w-24">Contact:</span>
                        <span>{selectedOrder.orderItems[0].discountName.contactName}</span>
                      </div>
                      <div className="flex">
                        <span className="font-medium text-gray-600 w-24">Mobile:</span>
                        <span>{selectedOrder.orderItems[0].discountName.mobile1}</span>
                      </div>
                      <div className="flex">
                        <span className="font-medium text-gray-600 w-24">Mobile 2:</span>
                        <span>{selectedOrder.orderItems[0].discountName.mobile2 || "N/A"}</span>
                      </div>
                      <div className="flex">
                        <span className="font-medium text-gray-600 w-24">WhatsApp:</span>
                        <span>{selectedOrder.orderItems[0].discountName.whatsapp || "N/A"}</span>
                      </div>
                      <div className="flex">
                        <span className="font-medium text-gray-600 w-24">Email:</span>
                        <span>{selectedOrder.orderItems[0].discountName.email || "N/A"}</span>
                      </div>
                      <div className="flex">
                        <span className="font-medium text-gray-600 w-24">Address:</span>
                        <span>
                          {selectedOrder.orderItems[0].discountName.address}, {selectedOrder.orderItems[0].discountName.city}, {selectedOrder.orderItems[0].discountName.state}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="font-medium text-gray-600 w-24">Discount:</span>
                        <span>{selectedOrder.orderItems[0].discountPercentage}%</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No vendor details available</p>
                  )}
                </div>
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-gray-7
00 border-b pb-2 mb-3 text-lg">Order Summary</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Status:</span>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${selectedOrder.status === "delivered" ? "bg-green-100 text-green-800" : 
                            selectedOrder.status === "processing" || selectedOrder.status === "shipped" ? "bg-blue-100 text-blue-800" : 
                            selectedOrder.status === "cancelled" ? "bg-red-100 text-red-800" : 
                            "bg-yellow-100 text-yellow-800"}`}
                      >
                        {(selectedOrder.status || "pending").toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>₹{selectedOrder.totalPrice?.toFixed(2) || 0}</span>
                    </div>
                    {selectedOrder.totalPriceAfterDiscount && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Discount:</span>
                        <span className="text-red-500">
                          -₹{(selectedOrder.totalPrice - selectedOrder.totalPriceAfterDiscount).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span className="text-gray-700">Total:</span>
                      <span className="text-gray-800">
                        ₹{(selectedOrder.totalPriceAfterDiscount || selectedOrder.totalPrice || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-700">Paid Amount:</span>
                      <span className="text-green-600">
                        ₹{((selectedOrder.totalPriceAfterDiscount || selectedOrder.totalPrice || 0) - (selectedOrder.dueAmount || 0)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-gray-800">Due Amount:</span>
                      <span className="text-red-600">₹{(selectedOrder.dueAmount || 0).toFixed(2)}</span>
                    </div>
                    <h4 className="font-bold mt-4 mb-2 text-gray-700 border-t pt-3 text-lg">Payment Information</h4>
                    {paymentDetails.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Status:</span>
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${selectedOrder.paymentStatus === "paid"
                                ? "bg-green-100 text-green-800"
                                : selectedOrder.paymentStatus === "partially_paid"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"}`}
                          >
                            {(selectedOrder.paymentStatus || "pending").toUpperCase()}
                          </span>
                        </div>
                        <button
                          onClick={() => navigateToPayments(selectedOrder._id)}
                          className="w-full mt-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          View/Add Payments
                        </button>
                      </div>
                    ) : (
                      <p className="text-yellow-600">No payment details found</p>
                    )}
                  </div>
                </div>
              </div>
              {paymentDetails.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-gray-700 border-b pb-2 mb-3 text-lg">Payment History</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remark</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paymentDetails.map((payment) => (
                          <tr key={payment._id}>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {payment.receivingDate ? new Date(payment.receivingDate).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">{payment.paymentMode || "N/A"}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">₹{payment.amount?.toLocaleString() || 0}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{payment.remark || "N/A"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <div>
                <h4 className="font-bold text-gray-700 border-b pb-2 mb-3 text-lg">Order Items</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount %</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price After Discount</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.orderItems?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded object-cover border border-gray-200"
                                  src={item.productImage || "https://via.placeholder.com/40"}
                                  alt={item.productName || "Product"}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{item.productName || "Product"}</div>
                                {/* <div className="text-sm text-gray-500">{item.size || "N/A"} | {item.color || "N/A"}</div> */}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">₹{(item.price || 0).toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{item.discountPercentage || 0}%</td>
                          <td className="px-4 py-3 text-sm text-gray-500">₹{(item.priceAfterDiscount || item.price || 0).toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{item.quantity || 0}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            ₹{((item.priceAfterDiscount || item.price || 0) * (item.quantity || 0)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="print-footer hidden mt-8">
                <div className="print-signature">
                  <div>
                    <p className="border-t border-gray-400 pt-2">Customer Signature</p>
                  </div>
                  <div>
                    <p className="border-t border-gray-400 pt-2">Company Representative</p>
                  </div>
                </div>
                <div className="mt-4 text-center text-sm text-gray-500">Thank you for your business!</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayOrders;