// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const RegistrationVendor = () => {
//   const [users, setUsers] = useState([]);
//   const [editingUser, setEditingUser] = useState(null);
//   const [formData, setFormData] = useState({
//     firmName: '',
//     contactName: '',
//     contactType: '',
//     mobile1: '',
//     mobile2: '',
//     whatsapp: '',
//     email: '',
//     state: '',
//     city: '',
//     address: '',
//     password: '',
//     discount: 0,
//     limit: 0
//   });

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       const response = await axios.get('https://backend.umairabaya.com/user');
//       console.log(response,'aaaaaaaaaaaaaaaaa')
//       setUsers(response.data);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     }
//   };


//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value
//     });
//   };

//   const handleEdit = (user) => {
//     setEditingUser(user._id);
//     setFormData({
//       firmName: user.firmName,
//       contactName: user.contactName,
//       contactType: user.contactType,
//       mobile1: user.mobile1,
//       mobile2: user.mobile2,
//       whatsapp: user.whatsapp,
//       email: user.email,
//       state: user.state,
//       city: user.city,
//       address: user.address,
//       password: user.password,
//       discount: user.discount,
//       limit: user.limit
//     });
//   };

//   const handleUpdate = async (id) => {
//     try {
//       await axios.put(`https://backend.umairabaya.com/user/users/${id}`, formData);
//       setEditingUser(null);
//       fetchUsers();
//     } catch (error) {
//       console.error('Error updating user:', error);
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`https://backend.umairabaya.com/user/users/${id}`);
//       fetchUsers();
//     } catch (error) {
//       console.error('Error deleting user:', error);
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold text-center mb-8">User Management</h1>

//       <div className="overflow-x-auto bg-white rounded-lg shadow">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Firm Name</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {users.map((user) => (
//               <tr key={user._id}>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   {editingUser === user._id ? (
//                     <input
//                       type="text"
//                       name="firmName"
//                       value={formData.firmName}
//                       onChange={handleInputChange}
//                       className="border rounded px-2 py-1 w-full"
//                     />
//                   ) : (
//                     user.firmName
//                   )}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   {editingUser === user._id ? (
//                     <input
//                       type="text"
//                       name="contactName"
//                       value={formData.contactName}
//                       onChange={handleInputChange}
//                       className="border rounded px-2 py-1 w-full"
//                     />
//                   ) : (
//                     user.contactName
//                   )}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   {editingUser === user._id ? (
//                     <input
//                       type="email"
//                       name="email"
//                       value={formData.email}
//                       onChange={handleInputChange}
//                       className="border rounded px-2 py-1 w-full"
//                     />
//                   ) : (
//                     user.email
//                   )}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   {editingUser === user._id ? (
//                     <input
//                       type="text"
//                       name="mobile1"
//                       value={formData.mobile1}
//                       onChange={handleInputChange}
//                       className="border rounded px-2 py-1 w-full"
//                     />
//                   ) : (
//                     user.mobile1
//                   )}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                   {editingUser === user._id ? (
//                     <div className="flex space-x-2">
//                       <button
//                         onClick={() => handleUpdate(user._id)}
//                         className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
//                       >
//                         Save
//                       </button>
//                       <button
//                         onClick={() => setEditingUser(null)}
//                         className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
//                       >
//                         Cancel
//                       </button>
//                     </div>
//                   ) : (
//                     <div className="flex space-x-2">
//                       <button
//                         onClick={() => handleEdit(user)}
//                         className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleDelete(user._id)}
//                         className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
//                       >
//                         Delete
//                       </button>
//                     </div>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Expanded Edit Form (optional) */}
//       {editingUser && (
//         <div className="mt-8 bg-white p-6 rounded-lg shadow">
//           <h2 className="text-xl font-semibold mb-4">Edit User Details</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Firm Name</label>
//               <input
//                 type="text"
//                 name="firmName"
//                 value={formData.firmName}
//                 onChange={handleInputChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Contact Name</label>
//               <input
//                 type="text"
//                 name="contactName"
//                 value={formData.contactName}
//                 onChange={handleInputChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Mobile 1</label>
//               <input
//                 type="text"
//                 name="mobile1"
//                 value={formData.mobile1}
//                 onChange={handleInputChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Mobile 2</label>
//               <input
//                 type="text"
//                 name="mobile2"
//                 value={formData.mobile2}
//                 onChange={handleInputChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
//               <input
//                 type="text"
//                 name="whatsapp"
//                 value={formData.whatsapp}
//                 onChange={handleInputChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Email</label>
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleInputChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">State</label>
//               <input
//                 type="text"
//                 name="state"
//                 value={formData.state}
//                 onChange={handleInputChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">City</label>
//               <input
//                 type="text"
//                 name="city"
//                 value={formData.city}
//                 onChange={handleInputChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               />
//             </div>
//             <div className="md:col-span-2">
//               <label className="block text-sm font-medium text-gray-700">Address</label>
//               <textarea
//                 name="address"
//                 value={formData.address}
//                 onChange={handleInputChange}
//                 rows="3"
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               ></textarea>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Discount</label>
//               <input
//                 type="number"
//                 name="discount"
//                 value={formData.discount}
//                 onChange={handleInputChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Limit</label>
//               <input
//                 type="number"
//                 name="limit"
//                 value={formData.limit}
//                 onChange={handleInputChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               />
//             </div>
//           </div>
//           <div className="mt-4 flex justify-end space-x-3">
//             <button
//               onClick={() => handleUpdate(editingUser)}
//               className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
//             >
//               Save Changes
//             </button>
//             <button
//               onClick={() => setEditingUser(null)}
//               className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RegistrationVendor;



import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RegistrationVendor = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firmName: '',
    contactName: '',
    contactType: '',
    mobile1: '',
    mobile2: '',
    whatsapp: '',
    email: '',
    state: '',
    city: '',
    address: '',
    password: '',
    discount: 0,
    limit: 0
  });

  const editFormRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://backend.umairabaya.com/user');
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleEdit = (user) => {
    setEditingUser(user._id);
    setFormData({
      firmName: user.firmName || '',
      contactName: user.contactName || '',
      contactType: user.contactType || '',
      mobile1: user.mobile1 || '',
      mobile2: user.mobile2 || '',
      whatsapp: user.whatsapp || '',
      email: user.email || '',
      state: user.state || '',
      city: user.city || '',
      address: user.address || '',
      password: user.password || '',
      discount: user.discount ?? 0,
      limit: user.limit ?? 0
    });

    setTimeout(() => {
      editFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`https://backend.umairabaya.com/user/users/${id}`, formData);
      setEditingUser(null);
      fetchUsers();
      toast.success('User updated successfully');
    } catch (error) {
      toast.error('Error updating user');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://backend.umairabaya.com/user/users/${id}`);
      fetchUsers();
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Error deleting user');
    }
  };

  const columns = [
    {
      name: 'Firm Name',
      selector: row => row.firmName,
      sortable: true
    },
    {
      name: 'Contact',
      selector: row => row.contactName,
      sortable: true
    },
    {
      name: 'Email',
      selector: row => row.email,
      sortable: true
    },
    {
      name: 'Mobile',
      selector: row => row.mobile1,
      sortable: true
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <h1 className="text-3xl font-bold text-center mb-8">Vendor Registration</h1>

      <DataTable
        columns={columns}
        data={users}
        pagination
        highlightOnHover
        responsive
        striped
      />

      {editingUser && (
        <div ref={editFormRef} className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Edit User Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(formData).map(([key, value]) => {
              if (key === "_id" || key === "__v") return null;
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              return (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700">{label}</label>
                  {key === 'address' ? (
                    <textarea
                      name={key}
                      value={value}
                      onChange={handleInputChange}
                      rows="3"
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                    ></textarea>
                  ) : (
                    <input
                      type={typeof value === 'number' ? 'number' : 'text'}
                      name={key}
                      value={value}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={() => handleUpdate(editingUser)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Save Changes
            </button>
            <button
              onClick={() => setEditingUser(null)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
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
