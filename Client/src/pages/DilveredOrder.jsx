import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useReactToPrint } from 'react-to-print';
import autoTable from 'jspdf-autotable';

const DeliveredOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState([]);
  const printRef = useRef();

  useEffect(() => {
    fetchDeliveredOrders();
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
          (order.paymentStatus && order.paymentStatus.toLowerCase().includes(searchStr)) ||
          (order.totalPriceAfterDiscount && order.totalPriceAfterDiscount.toString().includes(searchStr))
        );
      });
      setFilteredOrders(filtered);
    }
  }, [searchText, orders]);

  const fetchDeliveredOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/order/status/delivered`);
      const deliveredOrders = response.data.orders || [];
      setOrders(deliveredOrders);
      setFilteredOrders(deliveredOrders);
      toast.success(`Loaded ${deliveredOrders.length} delivered orders`);
    } catch (error) {
      console.error('Error fetching delivered orders:', error);
      toast.error('Failed to load delivered orders');
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

  const handleRefresh = () => {
    setSearchText('');
    setResetPaginationToggle(!resetPaginationToggle);
    fetchDeliveredOrders();
  };

  const exportToExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(filteredOrders.map(order => ({
        'Order ID': order.formattedId || 'N/A',
        'Vendor': order.orderItems[0]?.discountName?.firmName || 'N/A',
        'Total Amount': order.totalPriceAfterDiscount ? `₹${order.totalPriceAfterDiscount.toFixed(2)}` : '₹0.00',
        'Payment Status': order.paymentStatus ? order.paymentStatus.replace('_', ' ').toUpperCase() : 'N/A',
      })));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Delivered Orders');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(data, 'delivered_orders.xlsx');
      toast.success('Exported delivered orders to Excel');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export to Excel');
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF('landscape');
      doc.setFontSize(16);
      doc.text('Delivered Orders Report', 14, 20);

      const tableData = filteredOrders.map(order => [
        order.formattedId || 'N/A',
        order.orderItems[0]?.discountName?.firmName || 'N/A',
        order.totalPriceAfterDiscount ? `₹${order.totalPriceAfterDiscount.toFixed(2)}` : '₹0.00',
        order.paymentStatus ? order.paymentStatus.replace('_', ' ').toUpperCase() : 'N/A',
      ]);

      autoTable(doc, {
        head: [['Order ID', 'Vendor', 'Total Amount', 'Payment Status']],
        body: tableData,
        startY: 30,
        theme: 'grid',
        styles: {
          fontSize: 9,
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
        margin: { horizontal: 10 },
        tableWidth: 'auto',
      });
      
      doc.save('delivered_orders.pdf');
      toast.success('Exported delivered orders to PDF');
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
      cell: row => <span className="font-mono text-sm">{row.formattedId || 'N/A'}</span>,
      minWidth: '150px',
      grow: 1,
    },
    {
      name: 'Vendor',
      selector: row => row.orderItems[0]?.discountName?.firmName || 'N/A',
      sortable: true,
      cell: row => <span className="font-medium text-gray-800 text-sm">{row.orderItems[0]?.discountName?.firmName || 'N/A'}</span>,
      minWidth: '180px',
      grow: 2,
    },
    {
      name: 'Total Amount',
      selector: row => row.totalPriceAfterDiscount || 0,
      sortable: true,
      cell: row => (
        <span className="font-bold text-green-600 text-sm">
          ₹{row.totalPriceAfterDiscount ? row.totalPriceAfterDiscount.toFixed(2) : '0.00'}
        </span>
      ),
      minWidth: '120px',
      grow: 1,
    },
    {
      name: 'Payment Status',
      selector: row => row.paymentStatus || '',
      sortable: true,
      cell: row => {
        const status = row.paymentStatus || 'pending';
        let bgColor = 'bg-gray-100';
        let textColor = 'text-gray-800';
        if (status === 'paid') {
          bgColor = 'bg-green-100';
          textColor = 'text-green-800';
        } else if (status === 'pending') {
          bgColor = 'bg-yellow-100';
          textColor = 'text-yellow-800';
        } else if (status === 'partially_paid') {
          bgColor = 'bg-blue-100';
          textColor = 'text-blue-800';
        }
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
            {status.replace('_', ' ').toUpperCase()}
          </span>
        );
      },
      minWidth: '150px',
      grow: 1,
    },
    {
      name: 'Actions',
      cell: row => (
        <button
          onClick={() => viewOrderDetails(row)}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors text-xs sm:text-sm"
        >
          View Details
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      minWidth: '120px',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Delivered Orders</h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage all successfully delivered orders
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {filteredOrders.length} orders
              </span>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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

        <div className="px-4 py-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="w-full md:w-1/2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <button
                onClick={exportToExcel}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Excel
              </button>
              <button
                onClick={exportToPDF}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                PDF
              </button>
            </div>
          </div>

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
                <h3 className="mt-2 text-sm font-medium text-gray-900">No delivered orders</h3>
                <p className="mt-1 text-sm text-gray-500">No orders have been delivered yet.</p>
              </div>
            }
            pagination
            paginationResetDefaultPage={resetPaginationToggle}
            persistTableHead
            highlightOnHover
            striped
            responsive
            customStyles={{
              headCells: {
                style: {
                  backgroundColor: '#f8fafc',
                  color: '#64748b',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  paddingLeft: '0.5rem',
                  paddingRight: '0.5rem',
                },
              },
              cells: {
                style: {
                  paddingLeft: '0.5rem',
                  paddingRight: '0.5rem',
                  fontSize: '0.875rem',
                },
              },
              rows: {
                style: {
                  minHeight: '60px',
                  '&:hover': {
                    backgroundColor: '#f8f9fa',
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Order #{selectedOrder.formattedId || selectedOrder._id.slice(-6).toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-1.5 transition-colors text-sm"
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
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-gray-700 border-b pb-2 mb-3">Vendor Details</h4>
                  {selectedOrder.orderItems[0]?.discountName ? (
                    <div className="space-y-3 text-sm">
                      <div className="flex flex-col sm:flex-row">
                        <span className="font-medium text-gray-600 sm:w-24">Firm Name:</span>
                        <span>{selectedOrder.orderItems[0].discountName.firmName || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row">
                        <span className="font-medium text-gray-600 sm:w-24">Contact:</span>
                        <span>{selectedOrder.orderItems[0].discountName.contactName || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row">
                        <span className="font-medium text-gray-600 sm:w-24">Mobile:</span>
                        <span>{selectedOrder.orderItems[0].discountName.mobile1 || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row">
                        <span className="font-medium text-gray-600 sm:w-24">Email:</span>
                        <span>{selectedOrder.orderItems[0].discountName.email || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row">
                        <span className="font-medium text-gray-600 sm:w-24">Address:</span>
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
                
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-gray-700 border-b pb-2 mb-3">Order Summary</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Status:</span>
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {(selectedOrder.status || 'delivered').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>₹{selectedOrder.totalPrice?.toFixed(2) || '0.00'}</span>
                    </div>
                    {selectedOrder.totalPriceAfterDiscount && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-medium text-gray-800">
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
                  <h4 className="font-bold text-gray-700 border-b pb-2 mb-3">Payment History</h4>
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
                <h4 className="font-bold text-gray-700 border-b pb-2 mb-3">Order Items</h4>
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

export default DeliveredOrders;