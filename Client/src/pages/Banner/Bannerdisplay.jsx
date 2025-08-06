
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Bannerdisplay = () => {
  const [banners, setBanners] = useState([]);
  const api = ' https://backend.umairabaya.com/banner/alldisplay';

  // Load banners
  const loadData = async () => {
    try {
      const response = await axios.get(api);
      setBanners(response.data);
    } catch (error) {
      toast.error('Error fetching banners');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Delete banner
  const deluser = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this banner?');
    if (!confirmDelete) return;

    const deleteApi = ` https://backend.umairabaya.com/banner/deleted/${id}`;

    try {
      await axios.delete(deleteApi);
      toast.success('Banner deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Error deleting banner');
    }
  };

  // Columns for table
  const columns = [
    {
      name: 'Images',
      selector: row => row.images,
      cell: row => (
        <div className="flex gap-2 flex-wrap">
          {row.images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Banner ${index}`}
              className="w-24 h-16 object-cover rounded border"
            />
          ))}
        </div>
      ),
      sortable: false,
    },
    {
      name: 'URL',
      selector: row => row.URL,
      cell: row =>
        row.URL ? (
          <a
            href={row.URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {row.URL}
          </a>
        ) : (
          <span className="text-gray-400">N/A</span>
        ),
      sortable: true,
    },
    {
      name: 'Action',
      cell: row => (
        <button
          onClick={() => deluser(row._id)}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Delete
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-semibold text-center mb-6 text-gray-800">Banner Display</h1>
      <div className="bg-white p-4 rounded shadow-lg">
        <DataTable
          columns={columns}
          data={banners}
          pagination
          highlightOnHover
          responsive
          striped
          customStyles={{
            headCells: {
              style: {
                fontWeight: 'bold',
                fontSize: '15px',
                backgroundColor: '#f9fafb',
              },
            },
          }}
        />
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Bannerdisplay;
