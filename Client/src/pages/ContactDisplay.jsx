import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ContactDisplay = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      const response = await fetch(' https://backend.umairabaya.com/contact/allcontact');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Ensure data is an array before setting state
      if (!Array.isArray(data)) {
        if (data.data && Array.isArray(data.data)) {
          setEnquiries(data.data);
        } else {
          throw new Error('Expected array but got ' + typeof data);
        }
      } else {
        setEnquiries(data);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      toast.error(`Error loading enquiries: ${err.message}`);
      setEnquiries([]); // Set to empty array on error
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this enquiry?');
    if (!confirmed) return;

    try {
      const response = await fetch(` https://backend.umairabaya.com/contact/alldelete/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete enquiry: ${response.status}`);
      }

      setEnquiries(prev => prev.filter(enquiry => enquiry._id !== id));
      toast.success('Enquiry deleted successfully');
    } catch (err) {
      toast.error(`Error deleting enquiry: ${err.message}`);
    }
  };

  const columns = [
    {
      name: 'Name',
      selector: row => row.name || '-',
      sortable: true,
    },
    {
      name: 'Email',
      selector: row => row.email || '-',
      sortable: true,
    },
    {
      name: 'Phone',
      selector: row => row.phone || '-',
    },
    {
      name: 'Subject',
      selector: row => row.subject || '-',
    },
    {
      name: 'Message',
      selector: row => row.message || '-',
      grow: 2,
      wrap: true,
    },
    {
      name: 'Actions',
      cell: row => (
        <button
          onClick={() => handleDelete(row._id)}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
          aria-label={`Delete enquiry from ${row.name}`}
        >
          Delete
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  const filteredEnquiries = Array.isArray(enquiries) ? enquiries.filter(item => {
    const searchText = filterText.toLowerCase();
    return (
      (item.name?.toLowerCase().includes(searchText)) ||
      (item.email?.toLowerCase().includes(searchText)) ||
      (item.subject?.toLowerCase().includes(searchText)) ||
      (item.message?.toLowerCase().includes(searchText))
    );
  }) : [];

  const subHeaderComponentMemo = React.useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText('');
      }
    };

    return (
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by Name, Email, Subject or Message..."
          className="w-full p-2 border rounded-md shadow-sm focus:ring focus:ring-indigo-200 focus:border-indigo-300"
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          aria-label="Search enquiries"
        />
        {filterText && (
          <button
            onClick={handleClear}
            className="ml-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    );
  }, [filterText, resetPaginationToggle]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <button
          onClick={fetchEnquiries}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Enquiries</h1>

        <DataTable
          columns={columns}
          data={filteredEnquiries}
          pagination
          paginationResetDefaultPage={resetPaginationToggle}
          subHeader
          subHeaderComponent={subHeaderComponentMemo}
          highlightOnHover
          striped
          responsive
          persistTableHead
          progressPending={loading}
          noDataComponent={
            <div className="py-8 text-center text-gray-500">
              {filterText ? 'No matching enquiries found' : 'No enquiries available'}
            </div>
          }
        />
      </div>
    </div>
  );
};

export default ContactDisplay;