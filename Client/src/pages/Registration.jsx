import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';

const Registration = () => {
  const formik = useFormik({
    initialValues: {
      firmName: "",
      contactName: "",
      contactType: "",
      mobile1: "",
      mobile2: "",
      whatsapp: "",
      email: "",
      state: "",
      city: "",
      limit : "",
      address: "",
      password: "",
    },
    validationSchema: Yup.object({
      firmName: Yup.string().required("Required"),
      contactName: Yup.string().required("Required"),
      contactType: Yup.string().required("Required"),
      mobile1: Yup.string().length(10, "Must be exactly 10 digits").required("Required"),
      mobile2: Yup.string().length(10, "Must be exactly 10 digits"),
      whatsapp: Yup.string().length(10, "Must be exactly 10 digits"),
      email: Yup.string().email("Invalid email").required("Required"),
      state: Yup.string().required("Required"),
      city: Yup.string().required("Required"),
      address: Yup.string().required("Required"),
      password: Yup.string().required("Required"),
      limit: Yup.string().required("Required"),
    }),
    onSubmit: async (values) => {
      try {
       const response = await axios.post(`${import.meta.env.VITE_API_URL}/user/register`, values);
        console.log("Registration successful:", response.data);
        toast.success("Registration successful!");
        formik.resetForm(); // Reset the form after successful submission
      } catch (error) {
        console.error("Registration failed:", error.response.data);
        toast.error("Registration failed. Please try again.");
      }
    }
  });

  return (
    <div className="max-w-2xl  p-8 bg-white rounded-xl shadow-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
        🏢 Company Registration
      </h2>
      <form onSubmit={formik.handleSubmit} className="space-y-5">
        {/* Firm / Company Name */}
        <div>
          <label className="block font-medium mb-1">Firm / Company Name</label>
          <input
            type="text"
            name="firmName"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.firmName}
            className="w-full border px-4 py-2 rounded-lg"
            placeholder="XYZ Pvt Ltd"
          />
          {formik.touched.firmName && formik.errors.firmName && (
            <p className="text-sm text-red-500">{formik.errors.firmName}</p>
          )}
        </div>

        {/* Contact Person Name */}
        <div>
          <label className="block font-medium mb-1">Contact Person Name</label>
          <input
            type="text"
            name="contactName"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.contactName}
            className="w-full border px-4 py-2 rounded-lg"
            placeholder="John Doe"
          />
          {formik.touched.contactName && formik.errors.contactName && (
            <p className="text-sm text-red-500">{formik.errors.contactName}</p>
          )}
        </div>

        {/* Contact Person Type */}
        <div>
          <label className="block font-medium mb-1">Contact Person Type</label>
          <input
            type="text"
            name="contactType"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.contactType}
            className="w-full border px-4 py-2 rounded-lg"
            placeholder="Owner / Manager / Sales Head"
          />
          {formik.touched.contactType && formik.errors.contactType && (
            <p className="text-sm text-red-500">{formik.errors.contactType}</p>
          )}
        </div>

        {/* Mobile 1 */}
        <div>
          <label className="block font-medium mb-1">Mobile Number 1</label>
          <input
            type="text"
            name="mobile1"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.mobile1}
            className="w-full border px-4 py-2 rounded-lg"
            placeholder="1234567890"
          />
          {formik.touched.mobile1 && formik.errors.mobile1 && (
            <p className="text-sm text-red-500">{formik.errors.mobile1}</p>
          )}
        </div>

        {/* Mobile 2 */}
        <div>
          <label className="block font-medium mb-1">Mobile Number 2</label>
          <input
            type="text"
            name="mobile2"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.mobile2}
            className="w-full border px-4 py-2 rounded-lg"
            placeholder="Alternative"
          />
          {formik.touched.mobile2 && formik.errors.mobile2 && (
            <p className="text-sm text-red-500">{formik.errors.mobile2}</p>
          )}
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block font-medium mb-1">WhatsApp Number</label>
          <input
            type="text"
            name="whatsapp"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.whatsapp}
            className="w-full border px-4 py-2 rounded-lg"
            placeholder="WhatsApp number"
          />
          {formik.touched.whatsapp && formik.errors.whatsapp && (
            <p className="text-sm text-red-500">{formik.errors.whatsapp}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
            className="w-full border px-4 py-2 rounded-lg"
            placeholder="email@example.com"
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-sm text-red-500">{formik.errors.email}</p>
          )}
        </div>

        {/* State */}
        <div>
          <label className="block font-medium mb-1">State</label>
          <input
            type="text"
            name="state"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.state}
            className="w-full border px-4 py-2 rounded-lg"
            placeholder="e.g. Madhya Pradesh"
          />
          {formik.touched.state && formik.errors.state && (
            <p className="text-sm text-red-500">{formik.errors.state}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label className="block font-medium mb-1">City</label>
          <input
            type="text"
            name="city"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.city}
            className="w-full border px-4 py-2 rounded-lg"
            placeholder="e.g. Bhopal"
          />
          {formik.touched.city && formik.errors.city && (
            <p className="text-sm text-red-500">{formik.errors.city}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block font-medium mb-1">Address</label>
          <textarea
            name="address"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.address}
            className="w-full border px-4 py-2 rounded-lg resize-none"
            rows="3"
            placeholder="Full address with pin code"
          ></textarea>
          {formik.touched.address && formik.errors.address && (
            <p className="text-sm text-red-500">{formik.errors.address}</p>
          )}
        </div>

              <div>
          <label className="block font-medium mb-1">Limit</label>
          <input
            type="number"
            name="limit"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.limit}
            className="w-full border px-4 py-2 rounded-lg"
            placeholder="limit"
          />
          {formik.touched.limit && formik.errors.limit && (
            <p className="text-sm text-red-500">{formik.errors.limit}</p>
          )}
        </div>

        <div>
          <label className="block font-medium mb-1">Discount</label>
          <input
            type="discount"
            name="discount"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.discount}
            className="w-full border px-4 py-2 rounded-lg"
            placeholder="discount"
          />
          {formik.touched.discount && formik.errors.discount && (
            <p className="text-sm text-red-500">{formik.errors.discount}</p>
          )}
        </div>

        <div>
          <label className="block font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
            className="w-full border px-4 py-2 rounded-lg"
            placeholder="password"
          />
          {formik.touched.password && formik.errors.password && (
            <p className="text-sm text-red-500">{formik.errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Submit
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Registration;


