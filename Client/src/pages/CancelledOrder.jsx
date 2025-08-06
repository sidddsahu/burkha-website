
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const CancelledOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  useEffect(() => {
    fetchCancelledOrders();
  }, []);

  useEffect(() => {
    if (searchText === '') {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order => {
        const searchStr = searchText.toLowerCase();
        return (
          (order.formattedId && order.formattedId.toLowerCase().includes(searchStr)) ||
          (order.customerDetails?.name && order.customerDetails.name.toLowerCase().includes(searchStr)) ||
          (order.status && order.status.toLowerCase().includes(searchStr)) ||
          (order.cancellationDetails?.reason && order.cancellationDetails.reason.toLowerCase().includes(searchStr)) ||
          (order.totalPriceAfterDiscount && order.totalPriceAfterDiscount.toString().includes(searchStr))
        );
      });
      setFilteredOrders(filtered);
    }
  }, [searchText, orders]);

  const fetchCancelledOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/order/status/cancelled`);
      const cancelledOrders = response.data.orders || [];
      setOrders(cancelledOrders);
      setFilteredOrders(cancelledOrders);
      toast.success(`Loaded ${cancelledOrders.length} cancelled orders`);
    } catch (error) {
      console.error('Error fetching cancelled orders:', error);
      toast.error('Failed to load cancelled orders');
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = (orderId) => {
    console.log('View order:', orderId);
    toast.info(`Viewing details for cancelled order ${orderId.substring(0, 8)}...`);
  };

  const handleRefresh = () => {
    setSearchText('');
    setResetPaginationToggle(!resetPaginationToggle);
    fetchCancelledOrders();
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredOrders.map(order => ({
      'Order ID': order.formattedId,
      'Customer': order.customerDetails?.name || 'N/A',
      'Order Date': order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A',
      'Cancellation Date': order.updatedAt ? new Date(order.updatedAt).toLocaleString() : 'N/A',
      'Total Amount': order.totalPriceAfterDiscount ? `₹${order.totalPriceAfterDiscount.toFixed(2)}` : '₹0.00',
      'Cancellation Reason': order.cancellationDetails?.reason || 'Not specified',
      'Status': order.status ? order.status.toUpperCase() : 'N/A'
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cancelled Orders');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, 'cancelled_orders.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Cancelled Orders Report', 14, 16);

    const tableData = filteredOrders.map(order => [
      order.formattedId || 'N/A',
      order.customerDetails?.name || 'N/A',
      order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A',
      order.updatedAt ? new Date(order.updatedAt).toLocaleString() : 'N/A',
      order.totalPriceAfterDiscount ? `₹${order.totalPriceAfterDiscount.toFixed(2)}` : '₹0.00',
      order.cancellationDetails?.reason || 'Not specified',
      order.status ? order.status.toUpperCase() : 'N/A'
    ]);

    doc.autoTable({
      head: [['Order ID', 'Customer', 'Order Date', 'Cancellation Date', 'Total Amount', 'Cancellation Reason', 'Status']],
      body: tableData,
      startY: 20,
      styles: {
        cellPadding: 2,
        fontSize: 8,
        valign: 'middle',
        halign: 'left'
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });

    doc.save('cancelled_orders.pdf');
  };

  const columns = [
    {
      name: 'Order ID',
      selector: row => row.formattedId,
      sortable: true,
      cell: row => <span className="font-mono">{row.formattedId || 'N/A'}</span>,
    },
    {
      name: 'Customer',
      selector: (row) => row.orderItems[0]?.discountName?.firmName || 'N/A',
      sortable: true,
      cell: row => <span className="font-medium text-gray-800">{row.orderItems[0]?.discountName?.firmName || 'N/A'}</span>,
      width: '180px'
    },
    {
      name: 'Order Date',
      selector: row => row.createdAt || '',
      sortable: true,
      cell: row => (
        <span className="text-gray-600">
          {row.createdAt ? new Date(row.createdAt).toLocaleString() : 'N/A'}
        </span>
      ),
    },
    {
      name: 'Cancellation Date',
      selector: row => row.updatedAt || '',
      sortable: true,
      cell: row => (
        <span className="text-gray-600">
          {row.updatedAt ? new Date(row.updatedAt).toLocaleString() : 'N/A'}
        </span>
      ),
    },
    {
      name: 'Total Amount',
      selector: row => row.totalPriceAfterDiscount || 0,
      sortable: true,
      cell: row => (
        <span className="font-bold text-gray-600">
          ₹{row.totalPriceAfterDiscount ? row.totalPriceAfterDiscount.toFixed(2) : '0.00'}
        </span>
      ),
    }

  ];

  const subHeaderComponent = (
    <div className="flex justify-between items-center">
      <input
        type="text"
        placeholder="Search orders..."
        className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
      />
      <div className="flex space-x-2">
        <button 
          onClick={exportToExcel}
          className="px-4 py-2  bg-blue-700  rounded-md  transition-colors"
        >
          Export to Excel
        </button>
        <button
          onClick={exportToPDF}
          className="px-4 py-2  bg-blue-700 rounded-md  transition-colors"
        >
          Export to PDF
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Cancelled Orders</h2>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              Total: <span className="font-bold">{filteredOrders.length}</span> cancelled orders
            </span>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </>
              ) : 'Refresh'}
            </button>
          </div>
        </div>
              {console.log(filteredOrders,"dsfsf")}
        <DataTable
          columns={columns}
          data={filteredOrders}
          progressPending={loading}
          progressComponent={
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }
          noDataComponent={
            <div className="py-8 text-center text-gray-500">
              No cancelled orders found
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
                backgroundColor: '#f9fafb',
                color: '#374151',
                fontWeight: '600',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                paddingLeft: '1.5rem',
                paddingRight: '1.5rem',
              },
            },
            cells: {
              style: {
                paddingLeft: '1.5rem',
                paddingRight: '1.5rem',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default CancelledOrders;