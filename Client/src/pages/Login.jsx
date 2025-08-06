// import React, { useEffect } from 'react';
// import { useFormik } from 'formik';
// import * as Yup from 'yup';
// import { useDispatch, useSelector } from 'react-redux';
// import { login } from '../components/auth/authSlice'; // Adjust the import path as necessary
// import { ToastContainer, toast } from 'react-toastify';
// import { useNavigate } from 'react-router-dom';

// const Login = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   // Select loading and error states from the Redux store
//   const { isLoading, isError, message } = useSelector((state) => state.auth);

//   // Formik setup
//   const formik = useFormik({
//     initialValues: {
//       email: '',
//       password: '',
//     },
//     validationSchema: Yup.object({
//       email: Yup.string().email("Invalid email format").required("Email is required"),
//       password: Yup.string().required("Password is required"),
//     }),
//     onSubmit: (values) => {
//       dispatch(login(values)); // Dispatch the login action with form values
//     },
//   });

//   // Effect to handle error messages and redirect on success
//   useEffect(() => {
//     if (isError) {
//       toast.error(message); // Show error message using toast
//       console.error(message); // Log error message to console
//     }
//   }, [isError, message]);

//   useEffect(() => {
//     if (!isError && message) {
//       // Assuming a successful login returns a message or user data
//       toast.success("Login successful!");
//       navigate('/'); // Redirect to dashboard or another page
//     }
//   }, [message, isError, navigate]);

//   return (
//     <div className="bg-gray-100 min-h-screen flex items-center justify-center">
//       <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
//         <h2 className="text-3xl font-bold text-center text-gray-800">Login to Your Account</h2>

//         {isError && (
//           <div className="alert alert-danger py-2 text-center text-red-500" role="alert" aria-live="assertive">
//             {message}
//           </div>
//         )}

//         <form onSubmit={formik.handleSubmit} className="space-y-5">
//           <div>
//             <label className="block text-gray-600 mb-1" htmlFor="email">Email</label>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="you@example.com"
//               onChange={formik.handleChange}
//               onBlur={formik.handleBlur}
//               value={formik.values.email}
//               required
//             />
//             {formik.touched.email && formik.errors.email && (
//               <p className="text-sm text-red-500">{formik.errors.email}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-gray-600 mb-1" htmlFor="password">Password</label>
//             <input
//               type="password"
//               id="password"
//               name="password"
//               className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="••••••••"
//               onChange={formik.handleChange}
//               onBlur={formik.handleBlur}
//               value={formik.values.password}
//               required
//             />
//             {formik.touched.password && formik.errors.password && (
//               <p className="text-sm text-red -500">{formik.errors.password}</p>
//             )}
//           </div>

//           <div className="flex items-center justify-between">
//             <label className="flex items-center space-x-2 text-sm">
//               <input type="checkbox" className="form-checkbox rounded" />
//               <span>Remember me</span>
//             </label>
//             <a href="#" className="text-sm text-blue-500 hover:underline">Forgot password?</a>
//           </div>

//           <button
//             type="submit"
//             className={`w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
//             disabled={isLoading}
//           >
//             {isLoading ? 'Logging in...' : 'Login'}
//           </button>
//         </form>

//         <p className="text-center text-sm text-gray-600">
//           Don’t have an account?{" "}
//           <a href="#" className ="text-blue-500 hover:underline">Sign up</a>
//         </p>
//       </div>
//       <ToastContainer /> {/* Toast container for notifications */}
//     </div>
//   );
// };

// export default Login;



import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../components/auth/authSlice';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Select loading and error states from the Redux store
  const { isLoading, isError, message, isSuccess } = useSelector((state) => state.auth);

  // Formik setup
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email format").required("Email is required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: (values) => {
      dispatch(login(values));
    },
  });

  // Effect to handle error messages
  useEffect(() => {
    if (isError) {
      toast.error(message || 'Login failed', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  }, [isError, message]);

  // Effect to handle success and redirect
  useEffect(() => {
    if (isSuccess) {
      toast.success('Login successful!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  }, [isSuccess, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <h2 className="text-3xl font-bold text-center">Welcome Back</h2>
          <p className="text-center text-blue-100 mt-1">Sign in to your account</p>
        </div>
        
        <div className="p-8 space-y-6">
          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 mb-1 font-medium" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className={`w-full px-4 py-3 rounded-lg border ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                placeholder="you@example.com"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-1 font-medium" htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className={`w-full px-4 py-3 rounded-lg border ${formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                placeholder="••••••••"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Login'}
            </button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 border-t border-gray-300"></div>
            <div className="relative bg-white px-4 text-sm text-gray-500">Or continue with</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="py-2 px-4 bg-white border border-gray-300 rounded-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 transition">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd" />
              </svg>
              Google
            </button>
            <button className="py-2 px-4 bg-white border border-gray-300 rounded-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 transition">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
              Facebook
            </button>
          </div>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-800 hover:underline">Sign up</a>
          </p>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default Login;