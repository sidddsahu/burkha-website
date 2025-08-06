// import React, { useEffect, useState, useCallback } from "react";
// import axios from "axios";
// import DataTable from "react-data-table-component";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useReactToPrint } from "react-to-print";
// import { debounce } from "lodash";
// import { jsPDF } from "jspdf";
// import autoTable from "jspdf-autotable";

// const Customer = () => {
//   const [state, setState] = useState({
//     orders: [],
//     filteredOrders: [],
//     loading: true,
//     error: null,
//     search: "",
//     selectedOrder: null,
//     paymentDetails: [],
//     paymentDetailsLoading: false,
//     updatingStatus: {}
//   });

//   const printRef = React.useRef();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const fetchOrders = useCallback(async () => {
//     try {
//       setState(prev => ({ ...prev, loading: true, error: null }));
//       const res = await axios.get(`${import.meta.env.VITE_API_URL}/order`);
//       setState(prev => ({
//         ...prev,
//         orders: res.data.orders,
//         filteredOrders: res.data.orders,
//         loading: false
//       }));
//     } catch (err) {
//       console.error("Failed to fetch orders:", err);
//       setState(prev => ({
//         ...prev,
//         loading: false,
//         error: "Failed to fetch orders. Please try again."
//       }));
//     }
//   }, []);

//   const fetchPaymentDetails = async (orderId) => {
//     try {
//       setState(prev => ({ ...prev, paymentDetailsLoading: true }));
//       const res = await axios.get(`${import.meta.env.VITE_API_URL}/payments/${orderId}`);
//       setState(prev => ({
//         ...prev,
//         paymentDetails: res.data.payments || [],
//         paymentDetailsLoading: false
//       }));
//     } catch (err) {
//       console.error("Failed to fetch payment details:", err);
//       setState(prev => ({
//         ...prev,
//         paymentDetails: [],
//         paymentDetailsLoading: false
//       }));
//     }
//   };

//   const updateOrderStatus = async (orderId, newStatus) => {
//     try {
//       setState(prev => ({
//         ...prev,
//         updatingStatus: { ...prev.updatingStatus, [orderId]: true }
//       }));

//       const orderToUpdate = state.orders.find(order => order._id === orderId);

//       await axios.put(`${import.meta.env.VITE_API_URL}/order/${orderId}`, { status: newStatus });
//       await fetchOrders();
      
//       if (state.selectedOrder?._id === orderId) {
//         closeModal();
//       }
//     } catch (err) {
//       console.error("Failed to update order status:", err);
//       alert("Failed to update order status. Please try again.");
//     } finally {
//       setState(prev => ({
//         ...prev,
//         updatingStatus: { ...prev.updatingStatus, [orderId]: false }
//       }));
//     }
//   };

//   const handleSearch = debounce((searchValue) => {
//     const result = state.orders.filter((order) => {
//       const searchLower = searchValue.toLowerCase();
//       return (
//         order._id?.toLowerCase().includes(searchLower) ||
//         (order.orderItems[0]?.discountName?.firmName?.toLowerCase().includes(searchLower)) ||
//         new Date(order.createdAt).toLocaleDateString().toLowerCase().includes(searchLower) ||
//         `${order.totalPriceAfterDiscount ?? order.totalPrice}`.toLowerCase().includes(searchLower) ||
//         order.status?.toLowerCase().includes(searchLower) ||
//         order.paymentStatus?.toLowerCase().includes(searchLower)
//       );
//     });
//     setState(prev => ({ ...prev, filteredOrders: result }));
//   }, 300);

//   const generatePDF = () => {
//     if (!state.selectedOrder) return;

//     const doc = new jsPDF();
//     const vendor = state.selectedOrder.orderItems[0]?.discountName;

//     // Header
//     doc.setFontSize(18);
//     doc.text("Order Invoice", 14, 20);

//     // Company Info
//     doc.setFontSize(10);
//     doc.text("Company Name", 14, 30);
//     doc.text("123 Business Street, City", 14, 36);
//     doc.text("Phone: (123) 456-7890", 14, 42);

//     // Vendor Details
//     doc.setFontSize(12);
//     doc.text("Vendor Details:", 14, 54);
//     doc.setFontSize(10);
//     doc.text(vendor?.firmName || "N/A", 14, 62);
//     doc.text(vendor?.contactName || "N/A", 14, 68);
//     doc.text(vendor?.email || "N/A", 14, 74);
//     doc.text(`${vendor?.address || ""}, ${vendor?.city || ""}, ${vendor?.state || ""}`, 14, 80);
//     if (vendor?.mobile1) doc.text(`Mobile: ${vendor.mobile1}`, 14, 86);
//     if (vendor?.whatsapp) doc.text(`WhatsApp: ${vendor.whatsapp}`, 14, 92);

//     // Order Details
//     doc.setFontSize(12);
//     doc.text(`Order #${state.selectedOrder._id.slice(-6).toUpperCase()}`, 140, 54);
//     doc.setFontSize(10);
//     doc.text(`Date: ${new Date(state.selectedOrder.createdAt).toLocaleDateString()}`, 140, 62);
//     doc.text(`Status: ${state.selectedOrder.status.toUpperCase()}`, 140, 68);
//     doc.text(`Payment: ${state.selectedOrder.paymentStatus.toUpperCase()}`, 140, 74);

//     // Items Table
//     const cols = ["Product", "Qty", "Price", "Discount %", "Price After Discount", "Total"];
//     const rows = state.selectedOrder.orderItems.map(item => [
//       item.productName,
//       item.quantity,
//       `₹${item.price.toFixed(2)}`,
//       `${item.discountPercentage}%`,
//       `₹${item.priceAfterDiscount.toFixed(2)}`,
//       `₹${(item.priceAfterDiscount * item.quantity).toFixed(2)}`
//     ]);

//     autoTable(doc, {
//       head: [cols],
//       body: rows,
//       startY: 100,
//       theme: 'grid',
//       styles: { fontSize: 8 },
//       headStyles: { fillColor: [66, 139, 202] },
//       columnStyles: {
//         0: { cellWidth: 50 },
//         1: { cellWidth: 20 },
//         2: { cellWidth: 30 },
//         3: { cellWidth: 30 },
//         4: { cellWidth: 30 },
//         5: { cellWidth: 30 }
//       }
//     });

//     // Summary
//     let finalY = doc.lastAutoTable.finalY + 10;
//     doc.setFontSize(10);
//     doc.text(`Subtotal: ₹${state.selectedOrder.totalPrice.toFixed(2)}`, 14, finalY);
//     if (state.selectedOrder.totalPriceAfterDiscount) {
//       doc.text(`After Discount: ₹${state.selectedOrder.totalPriceAfterDiscount.toFixed(2)}`, 14, finalY + 6);
//     }
//     doc.text(`Paid: ₹${state.selectedOrder.paidAmount || 0}`, 14, finalY + 12);
//     doc.text(`Due: ₹${state.selectedOrder.dueAmount || 
//       (state.selectedOrder.totalPriceAfterDiscount ?? state.selectedOrder.totalPrice) - 
//       (state.selectedOrder.paidAmount || 0)}`, 14, finalY + 18);

//     // Payment History
//     if (state.paymentDetails.length > 0) {
//       finalY += 30;
//       doc.setFontSize(12);
//       doc.text("Payment History", 14, finalY);
//       const paymentCols = ["Date", "Amount", "Method", "Reference"];
//       const paymentRows = state.paymentDetails.map(payment => [
//         new Date(payment.paymentDate).toLocaleDateString(),
//         `₹${payment.amount}`,
//         payment.paymentMethod,
//         payment.referenceNumber || "N/A"
//       ]);

//       autoTable(doc, {
//         head: [paymentCols],
//         body: paymentRows,
//         startY: finalY + 10,
//         theme: 'grid',
//         styles: { fontSize: 8 },
//         headStyles: { fillColor: [66, 139, 202] }
//       });
//       finalY = doc.lastAutoTable.finalY;
//     }

//     // Footer
//     doc.setFontSize(8);
//     doc.text("Thank you for your business!", 14, finalY + 20);
//     doc.save(`order-${state.selectedOrder._id.slice(-6)}.pdf`);
//   };

//   const handlePrint = useReactToPrint({
//     content: () => printRef.current,
//     pageStyle: `
//       @page { size: auto; margin: 5mm; }
//       @media print {
//         body { -webkit-print-color-adjust: exact; }
//         .no-print { display: none !important; }
//         .print-header { display: block !important; }
//         .print-footer { display: block !important; }
//         .print-logo { max-width: 150px; margin-bottom: 20px; }
//         .print-signature { margin-top: 50px; display: flex; justify-content: space-between; }
//         .print-photo { max-width: 200px; margin-top: 20px; }
//         .print-table { width: 100%; border-collapse: collapse; }
//         .print-table th, .print-table td { border: 1px solid #ddd; padding: 8px; }
//         .print-table th { background-color: #f2f2f2; }
//       }
//     `,
//     removeAfterPrint: true
//   });

//   const viewOrderDetails = async (order) => {
//     setState(prev => ({ ...prev, selectedOrder: order }));
//     await fetchPaymentDetails(order._id);
//   };

//   const closeModal = () => {
//     setState(prev => ({ ...prev, selectedOrder: null, paymentDetails: [] }));
//   };

//   const navigateToPayments = (orderId) => {
//     navigate(`/vendordetails/${orderId}`);
//   };

 

//   useEffect(() => {
//     fetchOrders();
//   }, [fetchOrders]);

//   const columns = [
//     {
//       name: "Order ID",
//       selector: (row) => row._id.slice(-6).toUpperCase(),
//       sortable: true,
//       width: "120px",
//     },
//     {
//       name: "Date",
//       selector: (row) => new Date(row.createdAt).toLocaleDateString(),
//       sortable: true,
//       width: "120px",
//     },
//     {
//       name: "Vendor",
//       cell: (row) => (
//         <button 
//           onClick={() => navigateToVendor(row.orderItems[0]?.discountName?._id)}
//           className="text-blue-600 hover:text-blue-800 hover:underline text-left"
//         >
//           {row.orderItems[0]?.discountName?.firmName || "N/A"}
//         </button>
//       ),
//       sortable: true,
//       width: "150px",
//     },
//     {
//       name: "Total",
//       selector: (row) => `₹${row.totalPriceAfterDiscount ?? row.totalPrice}`,
//       sortable: true,
//       width: "120px",
//     },
//     {
//       name: "Due Amount",
//       selector: (row) => `₹${row.dueAmount ?? (row.totalPriceAfterDiscount ?? row.totalPrice) - (row.paidAmount || 0)}`,
//       sortable: true,
//       width: "120px",
//     },
//     {
//       name: "limit",
//       selector: (row) => row.orderItems[0]?.discountName?.limit,
//       sortable: true,
//       width: "120px",
//     },
//       {
//       name: "vendor limit",
//       selector: (row) => {row.orderItems[0]?.discountName?.limit - row.dueAmount} ,
//       sortable: true,
//       width: "120px",
//     },
//     {
//       name: "Payment",
//       cell: (row) => (
//         <button
//           onClick={() => navigateToPayments(row._id)}
//           className="px-3 py-1 bg-green-50 text-green-600 text-xs rounded hover:bg-green-100"
//         >
//          Vendor Deatils
//         </button>
//       ),
//       width: "120px",
//     },

//   ];

//   return (
//     <div className="max-w-5xl py-8 mx-auto">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-bold text-gray-800">Vendor Details</h2>
//         <div className="flex gap-2">
//           <input
//             type="text"
//             placeholder="Search orders..."
//             onChange={(e) => handleSearch(e.target.value)}
//             className="px-4 py-2 border border-gray-300 rounded-md text-sm"
//           />
//           <button
//             onClick={fetchOrders}
//             className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 flex items-center gap-1"
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="h-4 w-4"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
//               />
//             </svg>
//             Refresh
//           </button>
//         </div>
//       </div>

//       {state.error && (
//         <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
//           {state.error}
//           <button 
//             onClick={fetchOrders}
//             className="ml-2 text-red-700 font-semibold"
//           >
//             Retry
//           </button>
//         </div>
//       )}

//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <DataTable
//           columns={columns}
//           data={state.filteredOrders}
//           progressPending={state.loading}
//           pagination
//           paginationPerPage={10}
//           paginationRowsPerPageOptions={[10, 25, 50, 100]}
//           highlightOnHover
//           striped
//           responsive
//           onRowClicked={viewOrderDetails}
//           noDataComponent={
//             <div className="p-4 text-center text-gray-500">
//               {state.error ? 'Error loading orders' : 'No orders found'}
//             </div>
//           }
//         />
//       </div>

   
//     </div>
//   );
// };

// export default Customer;



import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { useNavigate, useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { debounce } from "lodash";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const Customer = () => {
  const [state, setState] = useState({
    orders: [],
    filteredOrders: [],
    loading: true,
    error: null,
    search: "",
    selectedOrder: null,
    paymentDetails: [],
    paymentDetailsLoading: false,
    updatingStatus: {}
  });

  const printRef = React.useRef();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchOrders = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/order`);
      setState(prev => ({
        ...prev,
        orders: res.data.orders,
        filteredOrders: res.data.orders,
        loading: false
      }));
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Failed to fetch orders. Please try again."
      }));
    }
  }, []);

  const fetchPaymentDetails = async (orderId) => {
    try {
      setState(prev => ({ ...prev, paymentDetailsLoading: true }));
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/payments/${orderId}`);
      setState(prev => ({
        ...prev,
        paymentDetails: res.data.payments || [],
        paymentDetailsLoading: false
      }));
    } catch (err) {
      console.error("Failed to fetch payment details:", err);
      setState(prev => ({
        ...prev,
        paymentDetails: [],
        paymentDetailsLoading: false
      }));
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setState(prev => ({
        ...prev,
        updatingStatus: { ...prev.updatingStatus, [orderId]: true }
      }));

      const orderToUpdate = state.orders.find(order => order._id === orderId);

      await axios.put(`${import.meta.env.VITE_API_URL}/order/${orderId}`, { status: newStatus });
      await fetchOrders();
      
      if (state.selectedOrder?._id === orderId) {
        closeModal();
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Failed to update order status. Please try again.");
    } finally {
      setState(prev => ({
        ...prev,
        updatingStatus: { ...prev.updatingStatus, [orderId]: false }
      }));
    }
  };

  const handleSearch = debounce((searchValue) => {
    const result = state.orders.filter((order) => {
      const searchLower = searchValue.toLowerCase();
      return (
        order._id?.toLowerCase().includes(searchLower) ||
        (order.orderItems[0]?.discountName?.firmName?.toLowerCase().includes(searchLower)) ||
        new Date(order.createdAt).toLocaleDateString().toLowerCase().includes(searchLower) ||
        `${order.totalPriceAfterDiscount ?? order.totalPrice}`.toLowerCase().includes(searchLower) ||
        order.status?.toLowerCase().includes(searchLower) ||
        order.paymentStatus?.toLowerCase().includes(searchLower)
      );
    });
    setState(prev => ({ ...prev, filteredOrders: result }));
  }, 300);

  const generatePDF = () => {
    if (!state.selectedOrder) return;

    const doc = new jsPDF();
    const vendor = state.selectedOrder.orderItems[0]?.discountName;

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

    // Order Details
    doc.setFontSize(12);
    doc.text(`Order #${state.selectedOrder._id.slice(-6).toUpperCase()}`, 140, 54);
    doc.setFontSize(10);
    doc.text(`Date: ${new Date(state.selectedOrder.createdAt).toLocaleDateString()}`, 140, 62);
    doc.text(`Status: ${state.selectedOrder.status.toUpperCase()}`, 140, 68);
    doc.text(`Payment: ${state.selectedOrder.paymentStatus.toUpperCase()}`, 140, 74);

    // Items Table
    const cols = ["Product", "Qty", "Price", "Discount %", "Price After Discount", "Total"];
    const rows = state.selectedOrder.orderItems.map(item => [
      item.productName,
      item.quantity,
      `₹${item.price.toFixed(2)}`,
      `${item.discountPercentage}%`,
      `₹${item.priceAfterDiscount.toFixed(2)}`,
      `₹${(item.priceAfterDiscount * item.quantity).toFixed(2)}`
    ]);

    autoTable(doc, {
      head: [cols],
      body: rows,
      startY: 100,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 20 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 }
      }
    });

    // Summary
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Subtotal: ₹${state.selectedOrder.totalPrice.toFixed(2)}`, 14, finalY);
    if (state.selectedOrder.totalPriceAfterDiscount) {
      doc.text(`After Discount: ₹${state.selectedOrder.totalPriceAfterDiscount.toFixed(2)}`, 14, finalY + 6);
    }
    doc.text(`Paid: ₹${state.selectedOrder.paidAmount || 0}`, 14, finalY + 12);
    doc.text(`Due: ₹${state.selectedOrder.dueAmount || 
      (state.selectedOrder.totalPriceAfterDiscount ?? state.selectedOrder.totalPrice) - 
      (state.selectedOrder.paidAmount || 0)}`, 14, finalY + 18);

    // Payment History
    if (state.paymentDetails.length > 0) {
      finalY += 30;
      doc.setFontSize(12);
      doc.text("Payment History", 14, finalY);
      const paymentCols = ["Date", "Amount", "Method", "Reference"];
      const paymentRows = state.paymentDetails.map(payment => [
        new Date(payment.paymentDate).toLocaleDateString(),
        `₹${payment.amount}`,
        payment.paymentMethod,
        payment.referenceNumber || "N/A"
      ]);

      autoTable(doc, {
        head: [paymentCols],
        body: paymentRows,
        startY: finalY + 10,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] }
      });
      finalY = doc.lastAutoTable.finalY;
    }

    // Footer
    doc.setFontSize(8);
    doc.text("Thank you for your business!", 14, finalY + 20);
    doc.save(`order-${state.selectedOrder._id.slice(-6)}.pdf`);
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
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
    removeAfterPrint: true
  });

  const viewOrderDetails = async (order) => {
    setState(prev => ({ ...prev, selectedOrder: order }));
    await fetchPaymentDetails(order._id);
  };

  const closeModal = () => {
    setState(prev => ({ ...prev, selectedOrder: null, paymentDetails: [] }));
  };

  const navigateToPayments = (orderId) => {
    navigate(`/vendordetails/${orderId}`);
  };

  const navigateToVendor = (vendorId) => {
    if (vendorId) {
      navigate(`/vendor/${vendorId}`);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const columns = [
    {
      name: "Order ID",
      selector: (row) => row._id.slice(-6).toUpperCase(),
      sortable: true,
      width: "120px",
    },
    {
      name: "Date",
      selector: (row) => new Date(row.createdAt).toLocaleDateString(),
      sortable: true,
      width: "120px",
    },
    {
      name: "Vendor",
      cell: (row) => (
        <button 
          onClick={() => navigateToVendor(row.orderItems[0]?.discountName?._id)}
          className="text-blue-600 hover:text-blue-800 hover:underline text-left"
        >
          {row.orderItems[0]?.discountName?.firmName || "N/A"}
        </button>
      ),
      sortable: true,
      width: "150px",
    },

        {
      name: "Vendor details",
      cell: (row) => (
        <button 
          onClick={() => navigateToVendor(row.orderItems[0]?.discountName?.address)}
          className="text-blue-600 hover:text-blue-800 hover:underline text-left"
        >
          {row.orderItems[0]?.discountName?.address || "N/A"}
        </button>
      ),
      sortable: true,
      width: "150px",
    },


           {
            
      name: "Vendor details",
      cell: (row) => (
        <button 
          onClick={() => navigateToVendor(row.orderItems[0]?.discountName?.address)}
          className="text-blue-600 hover:text-blue-800 hover:underline text-left"
        >
          {row.orderItems[0]?.discountName?.email || "N/A"}
        </button>
      ),
      sortable: true,
      width: "150px",
    },

    
        


    

    {
      name: "Total",
      selector: (row) => `₹${row.totalPriceAfterDiscount ?? row.totalPrice}`,
      sortable: true,
      width: "120px",
    },
    {
      name: "Due Amount",
      selector: (row) => `₹${row.dueAmount ?? (row.totalPriceAfterDiscount ?? row.totalPrice) - (row.paidAmount || 0)}`,
      sortable: true,
      width: "120px",
    },
    {
      name: "limit",
      selector: (row) => row.orderItems[0]?.discountName?.limit,
      sortable: true,
      width: "120px",
    },
    {
      name: "vendor limit",
      selector: (row) => {
        const limit = row.orderItems[0]?.discountName?.limit || 0;
        const due = row.dueAmount ?? (row.totalPriceAfterDiscount ?? row.totalPrice) - (row.paidAmount || 0);
        return limit - due;
      },
      sortable: true,
      width: "120px",
    },
 
    {
      name: "Payment",
      cell: (row) => (
        <button
          onClick={() => navigateToPayments(row._id)}
          className="px-3 py-1 bg-green-50 text-green-600 text-xs rounded hover:bg-green-100"
        >
         Vendor Details
        </button>
      ),
      width: "120px",
    },
  ];

  return (
    <div className="max-w-6xl py-8 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Vendor Details</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search orders..."
            onChange={(e) => handleSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm"
          />
          <button
            onClick={fetchOrders}
            className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 flex items-center gap-1"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {state.error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {state.error}
          <button 
            onClick={fetchOrders}
            className="ml-2 text-red-700 font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <DataTable
          columns={columns}
          data={state.filteredOrders}
          progressPending={state.loading}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 25, 50, 100]}
          highlightOnHover
          striped
          responsive
          onRowClicked={viewOrderDetails}
          noDataComponent={
            <div className="p-4 text-center text-gray-500">
              {state.error ? 'Error loading orders' : 'No orders found'}
            </div>
          }
        />
      </div>
    </div>
  );
};

export default Customer;