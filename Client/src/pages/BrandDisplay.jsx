import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import { toast } from 'react-toastify';

const BrandDisplay = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  const apiUrl = ' https://backend.umairabaya.com/brand/display';


  console.log(brands,'sdfgh')
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get(apiUrl);
        console.log('Fetched data:', response.data.data);
        if (Array.isArray(response.data.data)) {
          setBrands(response.data.data);
        } else {
          setBrands([]);
          toast.error('Invalid data format received');
        }
      } catch (err) {
        setError(err.message);
        toast.error('Failed to fetch brands');
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const deleteBrand = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this brand?');
    if (!confirmDelete) return;

    try {
      await axios.delete(` https://backend.umairabaya.com/brand/${id}`);
      toast.success('Brand deleted successfully');
      setBrands(prev => prev.filter(brand => brand._id !== id));
    } catch (error) {
      toast.error('Error deleting brand');
      console.error('Error deleting brand:', error);
    }
  };

  const filteredBrands = Array.isArray(brands)
    ? brands.filter(
        item => item.Brandname && item.Brandname.toLowerCase().includes(filterText.toLowerCase())
      )
    : [];

  const columns = [
    {
      name: 'Brand Name',
      selector: row => row.Brandname,
      sortable: true,
      cell: row => <div className="font-medium text-gray-800">{row.Brandname}</div>,
      width: '200px',
    },
    {
      name: 'Images',
      cell: row => (
        <div className="flex flex-wrap gap-2 py-2">
          {Array.isArray(row.images) &&
            row.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${row.Brandname}-${index}`}
                className="w-16 h-16 object-cover rounded border border-gray-200"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/60';
                  e.target.alt = 'Placeholder image';
                }}
              />
            ))}
        </div>
      ),
      grow: 2,
    },
    {
      name: 'Actions',
      cell: row => (
        <div className="flex space-x-2">
          <button
            onClick={() => deleteBrand(row._id)}
            className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm transition duration-200"
          >
            Delete
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: '120px',
    }
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#f8fafc',
        borderBottomWidth: '1px',
        borderColor: '#e2e8f0',
      },
    },
    headCells: {
      style: {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#334155',
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
        minHeight: '72px',
        '&:not(:last-of-type)': {
          borderBottomWidth: '1px',
          borderColor: '#e2e8f0',
        },
        '&:hover': {
          backgroundColor: '#f8fafc',
        },
      },
    },
    pagination: {
      style: {
        borderTopWidth: '1px',
        borderColor: '#e2e8f0',
      },
    },
  };

  const SearchComponent = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText('');
      }
    };

    return (
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search brands..."
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {filterText && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }, [filterText, resetPaginationToggle]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Brand Management</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredBrands}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[5, 10, 15, 20]}
          paginationComponentOptions={{
            rowsPerPageText: 'Rows per page:',
            rangeSeparatorText: 'of',
            noRowsPerPage: false,
          }}
          highlightOnHover
          striped
          responsive
          persistTableHead
          customStyles={customStyles}
          subHeader
          subHeaderComponent={SearchComponent}
          noDataComponent={
            <div className="py-8 text-gray-500 text-center">
              {filterText ? (
                <p>No brands match your search for "{filterText}"</p>
              ) : (
                <p>No brands found. Add some brands to get started.</p>
              )}
            </div>
          }
        />
      </div>
    </div>
  );
};

export default BrandDisplay;
