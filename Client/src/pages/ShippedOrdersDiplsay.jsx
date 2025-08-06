// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import DataTable from 'react-data-table-component';
// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import { useReactToPrint } from 'react-to-print';

// const ShippedOrders = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchText, setSearchText] = useState('');
//   const [filteredOrders, setFilteredOrders] = useState([]);
//   const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [paymentDetails, setPaymentDetails] = useState([]);
//   const printRef = useRef();

//   useEffect(() => {
//     fetchShippedOrders();
//   }, []);

//   useEffect(() => {
//     if (searchText === '') {
//       setFilteredOrders(orders);
//     } else {
//       const filtered = orders.filter(order => {
//         const searchStr = searchText.toLowerCase();
//         return (
//           (order.formattedId && order.formattedId.toLowerCase().includes(searchStr)) ||
//           (order.orderItems[0]?.discountName?.firmName && order.orderItems[0].discountName.firmName.toLowerCase().includes(searchStr)) ||
//           (order.status && order.status.toLowerCase().includes(searchStr)) ||
//           (order.totalPriceAfterDiscount && order.totalPriceAfterDiscount.toString().includes(searchStr))
//         );
//       });
//       setFilteredOrders(filtered);
//     }
//   }, [searchText, orders]);

//   const fetchShippedOrders = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${import.meta.env.VITE_API_URL}/order/status/shipped`);
//       const shippedOrders = response.data.orders || [];
//       setOrders(shippedOrders);
//       setFilteredOrders(shippedOrders);
//       toast.success(`Loaded ${shippedOrders.length} shipped orders`);
//     } catch (error) {
//       console.error('Error fetching shipped orders:', error);
//       toast.error('Failed to load shipped orders');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchPaymentDetails = async (orderId) => {
//     try {
//       const res = await axios.get(`${import.meta.env.VITE_API_URL}/payments/${orderId}`);
//       setPaymentDetails(res.data.payments || []);
//     } catch (err) {
//       console.error('Failed to fetch payment details:', err);
//       setPaymentDetails([]);
//       toast.error('Failed to fetch payment details');
//     }
//   };

//   const viewOrderDetails = async (order) => {
//     setSelectedOrder(order);
//     await fetchPaymentDetails(order._id);
//   };

//   const closeModal = () => {
//     setSelectedOrder(null);
//     setPaymentDetails([]);
//   };

//   const markAsDelivered = async (orderId) => {
//     try {
//       await axios.patch(`${import.meta.env.VITE_API_URL}/order/${orderId}`, {
//         status: 'delivered',
//         'deliveryDetails.deliveredAt': new Date().toISOString(),
//       });
//       toast.success('Order marked as delivered');
//       fetchShippedOrders();
//     } catch (error) {
//       console.error('Error updating order status:', error);
//       toast.error('Failed to update order status');
//     }
//   };

//   const handleRefresh = () => {
//     setSearchText('');
//     setResetPaginationToggle(!resetPaginationToggle);
//     fetchShippedOrders();
//   };

//   const exportToExcel = () => {
//     try {
//       const worksheet = XLSX.utils.json_to_sheet(filteredOrders.map(order => ({
//         'Order ID': order.formattedId || 'N/A',
//         'Vendor': order.orderItems[0]?.discountName?.firmName || 'N/A',
//         'Order Date': order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
//         'Shipped Date': order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : 'N/A',
//         'Total Amount': order.totalPriceAfterDiscount ? `₹${order.totalPriceAfterDiscount.toFixed(2)}` : '₹0.00',
//         'Status': order.status ? order.status.toUpperCase() : 'N/A',
//       })));
//       const workbook = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(workbook, worksheet, 'Shipped Orders');
//       const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
//       const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
//       saveAs(data, 'shipped_orders.xlsx');
//       toast.success('Exported shipped orders to Excel');
//     } catch (error) {
//       console.error('Error exporting to Excel:', error);
//       toast.error('Failed to export to Excel');
//     }
//   };

//   const exportToPDF = () => {
//     try {
//       const doc = new jsPDF();
//       autoTable(doc, {
//         head: [['Order ID', 'Vendor', 'Order Date', 'Shipped Date', 'Total Amount', 'Status']],
//         body: filteredOrders.map(order => [
//           order.formattedId || 'N/A',
//           order.orderItems[0]?.discountName?.firmName || 'N/A',
//           order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
//           order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : 'N/A',
//           order.totalPriceAfterDiscount ? `₹${order.totalPriceAfterDiscount.toFixed(2)}` : '₹0.00',
//           order.status ? order.status.toUpperCase() : 'N/A',
//         ]),
//         startY: 30,
//         theme: 'grid',
//         styles: {
//           fontSize: 8,
//           cellPadding: 3,
//           valign: 'middle',
//           halign: 'left',
//         },
//         headStyles: {
//           fillColor: [41, 128, 185],
//           textColor: [255, 255, 255],
//           fontStyle: 'bold',
//         },
//         alternateRowStyles: {
//           fillColor: [245, 245, 245],
//         },
//         columnStyles: {
//           0: { cellWidth: 30 },
//           1: { cellWidth: 50 },
//           2: { cellWidth: 30 },
//           3: { cellWidth: 30 },
//           4: { cellWidth: 30 },
//           5: { cellWidth: 20 },
//         },
//       });
//       doc.setFontSize(16);
//       doc.text('Shipped Orders Report', 14, 20);
//       doc.save('shipped_orders.pdf');
//       toast.success('Exported shipped orders to PDF');
//     } catch (error) {
//       console.error('Error exporting to PDF:', error);
//       toast.error('Failed to export to PDF');
//     }
//   };

//   const handlePrint = useReactToPrint({
//     content: () => printRef.current,
//     documentTitle: `Order-${selectedOrder?._id.slice(-6).toUpperCase() || 'Order'}`,
//     pageStyle: `
//       @page { size: auto; margin: 5mm; }
//       @media print {
//         body { -webkit-print-color-adjust: exact; }
//         .no-print { display: none !important; }
//         .print-table { width: 100%; border-collapse: collapse; }
//         .print-table th, .print-table td { border: 1px solid #ddd; padding: 8px; }
//         .print-table th { background-color: #f2f2f2; }
//       }
//     `,
//   });

//   const columns = [
//     {
//       name: 'Order ID',
//       selector: row => row.formattedId,
//       sortable: true,
//       cell: row => <span className="font-mono text-sm text-gray-700">{row.formattedId || 'N/A'}</span>,
//       width: '150px',
//     },
//     {
//       name: 'Vendor',
//       selector: row => row.orderItems[0]?.discountName?.firmName || 'N/A',
//       sortable: true,
//       cell: row => <span className="font-medium text-gray-800">{row.orderItems[0]?.discountName?.firmName || 'N/A'}</span>,
//       width: '180px',
//     },
//     {
//       name: 'Order Date',
//       selector: row => row.createdAt || '',
//       sortable: true,
//       cell: row => (
//         <span className="text-gray-600 text-sm">
//           {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
//         </span>
//       ),
//       width: '120px',
//     },
//     {
//       name: 'Shipped Date',
//       selector: row => row.updatedAt || '',
//       sortable: true,
//       cell: row => (
//         <span className="text-gray-600 text-sm">
//           {row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : 'N/A'}
//         </span>
//       ),
//       width: '120px',
//     },
//     {
//       name: 'Total Amount',
//       selector: row => row.totalPriceAfterDiscount || 0,
//       sortable: true,
//       cell: row => (
//         <span className="font-semibold text-gray-800">
//           ₹{row.totalPriceAfterDiscount ? row.totalPriceAfterDiscount.toFixed(2) : '0.00'}
//         </span>
//       ),
//       width: '120px',
//     },
//     {
//       name: 'Status',
//       selector: row => row.status || '',
//       sortable: true,
//       cell: row => (
//         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//           row.status === 'delivered' ? 'bg-green-100 text-green-800' :
//           row.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
//           'bg-yellow-100 text-yellow-800'
//         }`}>
//           {row.status ? row.status.toUpperCase() : 'N/A'}
//         </span>
//       ),
//       width: '120px',
//     },
//     {
//       name: 'Actions',
//       cell: row => (
//         <div className="flex gap-2">
//           <button
//             onClick={() => viewOrderDetails(row)}
//             className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm transition-colors shadow-sm"
//           >
//             View
//           </button>
//           <button
//             onClick={() => markAsDelivered(row._id)}
//             className="px-3 py-1.5 bg-black text-white rounded-md  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-sm transition-colors shadow-sm"
//           >
//             Deliver
//           </button>
//         </div>
//       ),
//       ignoreRowClick: true,
//       allowOverflow: true,
//       button: true,
//     },
//   ];

//   const subHeaderComponent = (
//     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
//       <div className="w-full md:w-auto">
//         <div className="relative">
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//               <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
//             </svg>
//           </div>
//           <input
//             type="text"
//             placeholder="Search by ID, vendor, amount..."
//             className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm"
//             value={searchText}
//             onChange={e => setSearchText(e.target.value)}
//           />
//         </div>
//       </div>
//       <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
//         <button
//           onClick={exportToExcel}
//           className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
//         >
//           <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//           </svg>
//           Export Excel
//         </button>
//         <button
//           onClick={exportToPDF}
//           className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
//         >
//           <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//           </svg>
//           Export PDF
//         </button>
//       </div>
//     </div>
//   );

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <div className="bg-white rounded-lg shadow-md overflow-hidden">
//         <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//             <div>
//               <h2 className="text-2xl font-bold text-gray-800">Shipped Orders</h2>
//               <p className="mt-1 text-sm text-gray-600">
//                 Orders that have been shipped and are ready for delivery
//               </p>
//             </div>
//             <div className="flex items-center space-x-3">
//               <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
//                 {filteredOrders.length} orders
//               </span>
//               <button
//                 onClick={handleRefresh}
//                 className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <>
//                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Refreshing...
//                   </>
//                 ) : (
//                   <>
//                     <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                     </svg>
//                     Refresh
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>

//         <div className="px-6 py-4">
//           <DataTable
//             columns={columns}
//             data={filteredOrders}
//             progressPending={loading}
//             progressComponent={
//               <div className="flex justify-center py-12">
//                 <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
//               </div>
//             }
//             noDataComponent={
//               <div className="py-12 text-center">
//                 <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//                 <h3 className="mt-2 text-sm font-medium text-gray-900">No shipped orders</h3>
//                 <p className="mt-1 text-sm text-gray-500">Get started by shipping some orders.</p>
//               </div>
//             }
//             pagination
//             paginationResetDefaultPage={resetPaginationToggle}
//             subHeader
//             subHeaderComponent={subHeaderComponent}
//             persistTableHead
//             highlightOnHover
//             striped
//             customStyles={{
//               headCells: {
//                 style: {
//                   backgroundColor: '#f8fafc',
//                   color: '#64748b',
//                   fontWeight: '600',
//                   textTransform: 'uppercase',
//                   fontSize: '0.75rem',
//                   paddingLeft: '1rem',
//                   paddingRight: '1rem',
//                 },
//               },
//               cells: {
//                 style: {
//                   paddingLeft: '1rem',
//                   paddingRight: '1rem',
//                   fontSize: '0.875rem',
//                 },
//               },
//               rows: {
//                 style: {
//                   minHeight: '60px',
//                   '&:hover': {
//                     backgroundColor: '#f8fafc',
//                   },
//                 },
//               },
//             }}
//           />
//         </div>
//       </div>

//       {selectedOrder && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//             <div className="p-6" ref={printRef}>
//               <div className="flex justify-between items-start mb-6">
//                 <div>
//                   <h3 className="text-xl font-bold text-gray-800">
//                     Order #{selectedOrder.formattedId || selectedOrder._id.slice(-6).toUpperCase()}
//                   </h3>
//                   <p className="text-sm text-gray-500 mt-1">
//                     {new Date(selectedOrder.createdAt).toLocaleString()}
//                   </p>
//                 </div>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={handlePrint}
//                     className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
//                   >
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-4 w-4 mr-2"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
//                       />
//                     </svg>
//                     Print
//                   </button>
//                   <button
//                     onClick={exportToPDF}
//                     className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
//                   >
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-4 w-4 mr-2"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//                       />
//                     </svg>
//                     Save PDF
//                   </button>
//                   <button
//                     onClick={closeModal}
//                     className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                 <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
//                   <h4 className="font-bold text-gray-700 border-b pb-2 mb-3 text-lg">Vendor Details</h4>
//                   {selectedOrder.orderItems[0]?.discountName ? (
//                     <div className="space-y-3 text-sm">
//                       <div className="flex">
//                         <span className="font-medium text-gray-600 w-24">Firm Name:</span>
//                         <span>{selectedOrder.orderItems[0].discountName.firmName || 'N/A'}</span>
//                       </div>
//                       <div className="flex">
//                         <span className="font-medium text-gray-600 w-24">Contact:</span>
//                         <span>{selectedOrder.orderItems[0].discountName.contactName || 'N/A'}</span>
//                       </div>
//                       <div className="flex">
//                         <span className="font-medium text-gray-600 w-24">Mobile:</span>
//                         <span>{selectedOrder.orderItems[0].discountName.mobile1 || 'N/A'}</span>
//                       </div>
//                       <div className="flex">
//                         <span className="font-medium text-gray-600 w-24">Email:</span>
//                         <span>{selectedOrder.orderItems[0].discountName.email || 'N/A'}</span>
//                       </div>
//                       <div className="flex">
//                         <span className="font-medium text-gray-600 w-24">Address:</span>
//                         <span>
//                           {selectedOrder.orderItems[0].discountName.address || ''},{' '}
//                           {selectedOrder.orderItems[0].discountName.city || ''},{' '}
//                           {selectedOrder.orderItems[0].discountName.state || 'N/A'}
//                         </span>
//                       </div>
//                     </div>
//                   ) : (
//                     <p className="text-gray-500">No vendor details available</p>
//                   )}
//                 </div>
//                 <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
//                   <h4 className="font-bold text-gray-700 border-b pb-2 mb-3 text-lg">Order Summary</h4>
//                   <div className="space-y-3 text-sm">
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Order Status:</span>
//                       <span
//                         className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                           selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
//                           selectedOrder.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
//                           'bg-yellow-100 text-yellow-800'
//                         }`}
//                       >
//                         {(selectedOrder.status || 'shipped').toUpperCase()}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Subtotal:</span>
//                       <span>₹{selectedOrder.totalPrice?.toFixed(2) || '0.00'}</span>
//                     </div>
//                     {selectedOrder.totalPriceAfterDiscount && (
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Total:</span>
//                         <span className="text-gray-800 font-medium">
//                           ₹{selectedOrder.totalPriceAfterDiscount.toFixed(2)}
//                         </span>
//                       </div>
//                     )}
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Payment Status:</span>
//                       <span
//                         className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                           selectedOrder.paymentStatus === 'paid'
//                             ? 'bg-green-100 text-green-800'
//                             : selectedOrder.paymentStatus === 'partially_paid'
//                             ? 'bg-blue-100 text-blue-800'
//                             : 'bg-yellow-100 text-yellow-800'
//                         }`}
//                       >
//                         {(selectedOrder.paymentStatus || 'pending').replace('_', ' ').toUpperCase()}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               {paymentDetails.length > 0 && (
//                 <div className="mb-6">
//                   <h4 className="font-bold text-gray-700 border-b pb-2 mb-3 text-lg">Payment History</h4>
//                   <div className="overflow-x-auto">
//                     <table className="min-w-full divide-y divide-gray-200 print-table">
//                       <thead className="bg-gray-50">
//                         <tr>
//                           <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                           <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
//                           <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
//                           <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
//                         </tr>
//                       </thead>
//                       <tbody className="bg-white divide-y divide-gray-200">
//                         {paymentDetails.map((payment) => (
//                           <tr key={payment._id}>
//                             <td className="px-4 py-3 text-sm text-gray-500">
//                               {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}
//                             </td>
//                             <td className="px-4 py-3 text-sm text-gray-500">₹{payment.amount?.toFixed(2) || '0.00'}</td>
//                             <td className="px-4 py-3 text-sm text-gray-500">{payment.paymentMethod || 'N/A'}</td>
//                             <td className="px-4 py-3 text-sm text-gray-500">{payment.referenceNumber || 'N/A'}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               )}
//               <div>
//                 <h4 className="font-bold text-gray-700 border-b pb-2 mb-3 text-lg">Order Items</h4>
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200 print-table">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
//                         <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
//                         <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
//                         <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {selectedOrder.orderItems?.map((item, index) => (
//                         <tr key={index}>
//                           <td className="px-4 py-3">
//                             <div className="flex items-center">
//                               <div className="flex-shrink-0 h-10 w-10">
//                                 <img
//                                   className="h-10 w-10 rounded object-cover border border-gray-200"
//                                   src={item.productImage || 'https://via.placeholder.com/40'}
//                                   alt={item.productName || 'Product'}
//                                 />
//                               </div>
//                               <div className="ml-4">
//                                 <div className="text-sm font-medium text-gray-900">{item.productName || 'Product'}</div>
//                                 <div className="text-sm text-gray-500">{item.size || 'N/A'} | {item.color || 'N/A'}</div>
//                               </div>
//                             </div>
//                           </td>
//                           <td className="px-4 py-3 text-sm text-gray-500">₹{(item.price || 0).toFixed(2)}</td>
//                           <td className="px-4 py-3 text-sm text-gray-500">{item.quantity || 0}</td>
//                           <td className="px-4 py-3 text-sm text-gray-500">
//                             ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ShippedOrders;


import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useReactToPrint } from 'react-to-print';

const ShippedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState([]);
  const printRef = useRef();

  useEffect(() => {
    fetchShippedOrders();
  }, []);

  useEffect(() => {
    if (searchText === '') {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order => {
        const searchStr = searchText.toLowerCase();
        return (
          (order.formattedId && order.formattedId.toLowerCase().includes(searchStr)) ||
          (order.orderItems[0]?.discountName?.firmName && order.orderItems[0].discountName.firmName.toLowerCase().includes(searchStr)) ||
          (order.status && order.status.toLowerCase().includes(searchStr)) ||
          (order.totalPriceAfterDiscount && order.totalPriceAfterDiscount.toString().includes(searchStr))
        );
      });
      setFilteredOrders(filtered);
    }
  }, [searchText, orders]);

  const fetchShippedOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/order/status/shipped`);
      const shippedOrders = response.data.orders || [];
      setOrders(shippedOrders);
      setFilteredOrders(shippedOrders);
      toast.success(`Loaded ${shippedOrders.length} shipped orders`);
    } catch (error) {
      console.error('Error fetching shipped orders:', error);
      toast.error('Failed to load shipped orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentDetails = async (orderId) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/payments/${orderId}`);
      setPaymentDetails(res.data.payments || []);
    } catch (err) {
      console.error('Failed to fetch payment details:', err);
      setPaymentDetails([]);
      toast.error('Failed to fetch payment details');
    }
  };

  const viewOrderDetails = async (order) => {
    setSelectedOrder(order);
    await fetchPaymentDetails(order._id);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setPaymentDetails([]);
  };

  const markAsDelivered = async (orderId) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/order/${orderId}`, {
        status: 'delivered',
        'deliveryDetails.deliveredAt': new Date().toISOString(),
      });
      toast.success('Order marked as delivered');
      fetchShippedOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleRefresh = () => {
    setSearchText('');
    setResetPaginationToggle(!resetPaginationToggle);
    fetchShippedOrders();
  };

  const exportToExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(filteredOrders.map(order => ({
        'Order ID': order.formattedId || 'N/A',
        'Vendor': order.orderItems[0]?.discountName?.firmName || 'N/A',
        'Order Date': order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
        'Shipped Date': order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : 'N/A',
        'Total Amount': order.totalPriceAfterDiscount ? `₹${order.totalPriceAfterDiscount.toFixed(2)}` : '₹0.00',
        'Status': order.status ? order.status.toUpperCase() : 'N/A',
      })));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Shipped Orders');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(data, 'shipped_orders.xlsx');
      toast.success('Exported shipped orders to Excel');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export to Excel');
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [['Order ID', 'Vendor', 'Order Date', 'Shipped Date', 'Total Amount', 'Status']],
        body: filteredOrders.map(order => [
          order.formattedId || 'N/A',
          order.orderItems[0]?.discountName?.firmName || 'N/A',
          order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
          order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : 'N/A',
          order.totalPriceAfterDiscount ? `₹${order.totalPriceAfterDiscount.toFixed(2)}` : '₹0.00',
          order.status ? order.status.toUpperCase() : 'N/A',
        ]),
        startY: 30,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 3,
          valign: 'middle',
          halign: 'left',
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 50 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 },
          4: { cellWidth: 30 },
          5: { cellWidth: 20 },
        },
      });
      doc.setFontSize(16);
      doc.text('Shipped Orders Report', 14, 20);
      doc.save('shipped_orders.pdf');
      toast.success('Exported shipped orders to PDF');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export to PDF');
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Order-${selectedOrder?._id.slice(-6).toUpperCase() || 'Order'}`,
    pageStyle: `
      @page { size: auto; margin: 5mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .no-print { display: none !important; }
        .print-table { width: 100%; border-collapse: collapse; }
        .print-table th, .print-table td { border: 1px solid #ddd; padding: 8px; }
        .print-table th { background-color: #f2f2f2; }
      }
    `,
  });

  const columns = [
    {
      name: 'Order ID',
      selector: row => row.formattedId,
      sortable: true,
      cell: row => <span className="font-mono text-sm text-gray-700">{row.formattedId || 'N/A'}</span>,
      width: '150px',
    },
    {
      name: 'Vendor',
      selector: row => row.orderItems[0]?.discountName?.firmName || 'N/A',
      sortable: true,
      cell: row => <span className="font-medium text-gray-800">{row.orderItems[0]?.discountName?.firmName || 'N/A'}</span>,
      width: '180px',
    },
    {
      name: 'Order Date',
      selector: row => row.createdAt || '',
      sortable: true,
      cell: row => (
        <span className="text-gray-600 text-sm">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
      width: '120px',
    },
    {
      name: 'Shipped Date',
      selector: row => row.updatedAt || '',
      sortable: true,
      cell: row => (
        <span className="text-gray-600 text-sm">
          {row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
      width: '120px',
    },
    {
      name: 'Total Amount',
      selector: row => row.totalPriceAfterDiscount || 0,
      sortable: true,
      cell: row => (
        <span className="font-semibold text-gray-800">
          ₹{row.totalPriceAfterDiscount ? row.totalPriceAfterDiscount.toFixed(2) : '0.00'}
        </span>
      ),
      width: '120px',
    },
    {
      name: 'Status',
      selector: row => row.status || '',
      sortable: true,
      cell: row => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.status === 'delivered' ? 'bg-green-100 text-green-800' :
          row.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {row.status ? row.status.toUpperCase() : 'N/A'}
        </span>
      ),
      width: '120px',
    },
    
  ];

  const subHeaderComponent = (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
      <div className="w-full md:w-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by ID, vendor, amount..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        <button
          onClick={exportToExcel}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Excel
        </button>
        <button
          onClick={exportToPDF}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export PDF
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Shipped Orders</h2>
              <p className="mt-1 text-sm text-gray-500">
                Orders that have been shipped and are ready for delivery
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {filteredOrders.length} orders
              </span>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-2 border border-gray-200 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <DataTable
            columns={columns}
            data={filteredOrders}
            progressPending={loading}
            progressComponent={
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            }
            noDataComponent={
              <div className="py-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No shipped orders</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by shipping some orders.</p>
              </div>
            }
            pagination
            paginationResetDefaultPage={resetPaginationToggle}
            subHeader
            subHeaderComponent={subHeaderComponent}
            persistTableHead
            highlightOnHover
            striped
            customStyles={{
              headCells: {
                style: {
                  backgroundColor: '#f8fafc',
                  color: '#64748b',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                },
              },
              cells: {
                style: {
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                  fontSize: '0.875rem',
                },
              },
              rows: {
                style: {
                  minHeight: '60px',
                  '&:hover': {
                    backgroundColor: '#f8fafc',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6" ref={printRef}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Order #{selectedOrder.formattedId || selectedOrder._id.slice(-6).toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-200 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
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
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
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
                    Save PDF
                  </button>
                  <button
                    onClick={closeModal}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-700 border-b pb-2 mb-3 text-lg">Vendor Details</h4>
                  {selectedOrder.orderItems[0]?.discountName ? (
                    <div className="space-y-3 text-sm">
                      <div className="flex">
                        <span className="font-medium text-gray-600 w-24">Firm Name:</span>
                        <span>{selectedOrder.orderItems[0].discountName.firmName || 'N/A'}</span>
                      </div>
                      <div className="flex">
                        <span className="font-medium text-gray-600 w-24">Contact:</span>
                        <span>{selectedOrder.orderItems[0].discountName.contactName || 'N/A'}</span>
                      </div>
                      <div className="flex">
                        <span className="font-medium text-gray-600 w-24">Mobile:</span>
                        <span>{selectedOrder.orderItems[0].discountName.mobile1 || 'N/A'}</span>
                      </div>
                      <div className="flex">
                        <span className="font-medium text-gray-600 w-24">Email:</span>
                        <span>{selectedOrder.orderItems[0].discountName.email || 'N/A'}</span>
                      </div>
                      <div className="flex">
                        <span className="font-medium text-gray-600 w-24">Address:</span>
                        <span>
                          {selectedOrder.orderItems[0].discountName.address || ''},{' '}
                          {selectedOrder.orderItems[0].discountName.city || ''},{' '}
                          {selectedOrder.orderItems[0].discountName.state || 'N/A'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No vendor details available</p>
                  )}
                </div>
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-700 border-b pb-2 mb-3 text-lg">Order Summary</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Status:</span>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          selectedOrder.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {(selectedOrder.status || 'shipped').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>₹{selectedOrder.totalPrice?.toFixed(2) || '0.00'}</span>
                    </div>
                    {selectedOrder.totalPriceAfterDiscount && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="text-gray-800 font-medium">
                          ₹{selectedOrder.totalPriceAfterDiscount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          selectedOrder.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : selectedOrder.paymentStatus === 'partially_paid'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {(selectedOrder.paymentStatus || 'pending').replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {paymentDetails.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 border-b pb-2 mb-3 text-lg">Payment History</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 print-table">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paymentDetails.map((payment) => (
                          <tr key={payment._id}>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">₹{payment.amount?.toFixed(2) || '0.00'}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{payment.paymentMethod || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{payment.referenceNumber || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-gray-700 border-b pb-2 mb-3 text-lg">Order Items</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 print-table">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
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
                                  src={item.productImage || 'https://via.placeholder.com/40'}
                                  alt={item.productName || 'Product'}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{item.productName || 'Product'}</div>
                                <div className="text-sm text-gray-500">{item.size || 'N/A'} | {item.color || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">₹{(item.price || 0).toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{item.quantity || 0}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippedOrders;