import React, { useEffect, useState } from 'react';
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/breadcrumbs";
import { MdOutlineArrowBackIos } from 'react-icons/md';
import { Link } from 'react-router-dom';
import CustomInput from './CustomInput';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from 'axios';
import { config } from '../utils/config';
import { createOrder } from '../features/user/userSlice';

const shippingSchema = Yup.object().shape({
  firstName: Yup.string().required("FirstName is required"),
  lastName: Yup.string().required("LastName is required"),
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  other: Yup.string().notRequired(),
  pincode: Yup.number().required("PinCode is required"),
  country: Yup.string().required("Country is required"),
});

const CheckOutDetails = () => {
  const dispatch = useDispatch();
  const cartState = useSelector(state => state.auth.userCart);
  const [cartTotal, setCartTotal] = useState(0);
  const [productDetail, setProductDetail] = useState([]);

  useEffect(() => {
    let tot = 0;
    let items = [];
    for (let idx = 0; idx < cartState?.length; idx++) {
      tot += cartState[idx]?.price * cartState[idx]?.quantity;
      items.push({
        product: cartState[idx]?.productId.id,
        quantity: cartState[idx]?.quantity,
        color: cartState[idx]?.color,
        price: cartState[idx]?.price
      });
    }
    setProductDetail(items);
    setCartTotal(tot);
  }, [cartState]);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      other: "",
      country: "",
      pincode: ""
    },
    validationSchema: shippingSchema,
    onSubmit: (values) => {
      checkOutHandler(values);
    },
  });

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const checkOutHandler = async (shippingInfo) => {
    if (!cartTotal || cartTotal <= 0) {
      alert("Cart total must be greater than zero to proceed with checkout.");
      return;
    }

    const response = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!response) {
      alert("Razorpay SDK failed to load");
      return;
    }

    try {
      const result = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user/order/checkout`,
        { amount: cartTotal },
        config
      );

      if (!result || !result.data?.order) {
        alert("Something went wrong during checkout");
        return;
      }

      const { amount, id: order_id, currency } = result.data.order;

      const options = {
        key: "rzp_test_o3vkPO5n8pMXdo",
        amount,
        currency,
        name: "Digitic",
        description: "Test Transaction",
        order_id,
        handler: async function (response) {
          const data = {
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
          };

          await axios.post(`${import.meta.env.VITE_API_URL}/api/user/order/paymentVerification`, data, config);

          dispatch(createOrder({
            totalPrice: cartTotal,
            totalPriceAfterDiscount: cartTotal,
            orderItems: productDetail,
            shippingInfo,
            paymentInfo: {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
            },
          }));
        },
        prefill: {
          name: "Digitic",
          email: "digitic@example.com",
          contact: "9999999999",
        },
        notes: {
          address: "Digitic Corporate Office",
        },
        theme: {
          color: "#61dafb",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("Checkout failed. Please try again.");
    }
  };

  return (
    <div className='w-full md:w-[50%] bg-white border-2 py-10 px-5'>
      <h2 className='text-3xl font-medium text-black'>Digitic</h2>
      <Breadcrumbs className='mt-5'>
        <BreadcrumbItem>Cart</BreadcrumbItem>
        <BreadcrumbItem>Information</BreadcrumbItem>
        <BreadcrumbItem>Shipping</BreadcrumbItem>
        <BreadcrumbItem>Payment</BreadcrumbItem>
      </Breadcrumbs>

      <h2 className='text-2xl mt-5 text-black'>Contact Information</h2>
      <p className='text-xl mt-2 text-gray-400'>adityajainghetal@gmail.com</p>

      <h2 className='text-2xl mt-5 text-black'>Shipping Address</h2>
      <form onSubmit={formik.handleSubmit} className='mb-10'>

        <select className='w-full p-3 text-xl outline-none border rounded-xl px-5 mt-5'>
          <option>Saved Address</option>
        </select>

        <select
          className='w-full p-3 text-xl outline-none border rounded-xl px-5 mt-5'
          name='country'
          onChange={formik.handleChange}
          value={formik.values.country}>
          <option value="">Select Country</option>
          <option value="India">India</option>
          <option value="China">China</option>
        </select>
        {formik.touched.country && formik.errors.country && (
          <div className="text-red-400 ms-2 mt-2 text-sm">{formik.errors.country}</div>
        )}

        <div className='flex gap-2'>
          <CustomInput type="text" placeholder='First Name' name='firstName'
            onCh={formik.handleChange} val={formik.values.firstName} />
          {formik.touched.firstName && formik.errors.firstName && (
            <div className="text-red-400 ms-2 mt-2 text-sm">{formik.errors.firstName}</div>
          )}

          <CustomInput type="text" placeholder='Last Name' name='lastName'
            onCh={formik.handleChange} val={formik.values.lastName} />
          {formik.touched.lastName && formik.errors.lastName && (
            <div className="text-red-400 ms-2 mt-2 text-sm">{formik.errors.lastName}</div>
          )}
        </div>

        <CustomInput type="text" placeholder='Address' name='address'
          onCh={formik.handleChange} val={formik.values.address} />
        {formik.touched.address && formik.errors.address && (
          <div className="text-red-400 ms-2 mt-2 text-sm">{formik.errors.address}</div>
        )}

        <CustomInput type="text" placeholder='Apartment, suite, etc. (optional)' name='other'
          onCh={formik.handleChange} val={formik.values.other} />

        <div className='flex gap-2'>
          <CustomInput type="text" placeholder='City' name='city'
            onCh={formik.handleChange} val={formik.values.city} />
          {formik.touched.city && formik.errors.city && (
            <div className="text-red-400 ms-2 mt-2 text-sm">{formik.errors.city}</div>
          )}

          <select
            className='w-full p-3 text-xl outline-none border rounded-xl px-5 mt-5'
            name='state'
            onChange={formik.handleChange}
            value={formik.values.state}>
            <option value="">Select State</option>
            <option value="MP">MP</option>
          </select>
          {formik.touched.state && formik.errors.state && (
            <div className="text-red-400 ms-2 mt-2 text-sm">{formik.errors.state}</div>
          )}

          <CustomInput type="text" placeholder='Zip Code' name='pincode'
            onCh={formik.handleChange} val={formik.values.pincode} />
          {formik.touched.pincode && formik.errors.pincode && (
            <div className="text-red-400 ms-2 mt-2 text-sm">{formik.errors.pincode}</div>
          )}
        </div>

        <div className='flex justify-between md:items-center mt-10 flex-col md:flex-row gap-5 md:gap-0 items-start'>
          <Link to='/cart' className='flex gap-2 items-center text-xl'>
            <MdOutlineArrowBackIos /> Return To Cart
          </Link>

          <button className='uppercase hover:bg-amber-500 bg-[#232F3E] text-white px-7 py-4 rounded-[30px]' type='submit'>
            Buy Now
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckOutDetails;
