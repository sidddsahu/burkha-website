import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RegistrationVendor = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firmName: "",
    contactName: "",
    contactType: "",
    mobile1: "",
    mobile2: "",
    whatsapp: "",
    email: "",
    state: "",
    city: "",
    address: "",
    password: "",
    discount: 0,
    limit: 0,
  });

  const editFormRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("https://backend.umairabaya.com/user");
      setUsers(response.data);
    } catch (error) {
      toast.error("Failed to fetch users");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleEdit = (user) => {
    setEditingUser(user._id);
    setFormData({
      firmName: user.firmName || "",
      contactName: user.contactName || "",
      contactType: user.contactType || "",
      mobile1: user.mobile1 || "",
      mobile2: user.mobile2 || "",
      whatsapp: user.whatsapp || "",
      email: user.email || "",
      state: user.state || "",
      city: user.city || "",
      address: user.address || "",
      password: user.password || "",
      discount: user.discount ?? 0,
      limit: user.limit ?? 0,
    });

    setTimeout(() => {
      editFormRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(
        `https://backend.umairabaya.com/user/users/${id}`,
        formData
      );
      setEditingUser(null);
      fetchUsers();
      toast.success("User updated successfully");
    } catch (error) {
      toast.error("Error updating user");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://backend.umairabaya.com/user/users/${id}`);
      fetchUsers();
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error("Error deleting user");
    }
  };

  const columns = [
    {
      name: "Firm Name",
      selector: (row) => row.firmName,
      sortable: true,
    },
    {
      name: "Contact",
      selector: (row) => row.contactName,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: "Mobile",
      selector: (row) => row.mobile1,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className='flex gap-2'>
          <button
            onClick={() => handleEdit(row)}
            className='bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600'
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className='bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600'
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className='container mx-auto px-4 py-8'>
      <ToastContainer position='top-right' autoClose={2000} hideProgressBar />
      <h1 className='text-3xl font-bold text-center mb-8'>
        Vendor Registration
      </h1>

      <DataTable
        columns={columns}
        data={users}
        pagination
        highlightOnHover
        responsive
        striped
      />

      {editingUser && (
        <div ref={editFormRef} className='mt-8 bg-white p-6 rounded-lg shadow'>
          <h2 className='text-xl font-semibold mb-4'>Edit User Details</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {Object.entries(formData).map(([key, value]) => {
              if (key === "_id" || key === "__v") return null;
              const label = key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase());
              return (
                <div key={key}>
                  <label className='block text-sm font-medium text-gray-700'>
                    {label}
                  </label>
                  {key === "address" ? (
                    <textarea
                      name={key}
                      value={value}
                      onChange={handleInputChange}
                      rows='3'
                      className='mt-1 block w-full border border-gray-300 rounded-md py-2 px-3'
                    ></textarea>
                  ) : (
                    <input
                      type={typeof value === "number" ? "number" : "text"}
                      name={key}
                      value={value}
                      onChange={handleInputChange}
                      className='mt-1 block w-full border border-gray-300 rounded-md py-2 px-3'
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className='mt-4 flex justify-end space-x-3'>
            <button
              onClick={() => handleUpdate(editingUser)}
              className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600'
            >
              Save Changes
            </button>
            <button
              onClick={() => setEditingUser(null)}
              className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600'
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationVendor;
