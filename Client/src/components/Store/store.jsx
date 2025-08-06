// import { configureStore } from "@reduxjs/toolkit";
// import authReducer from "../../pages/auth/authSlice"

// export const store = configureStore({
//     reducer:{
//         auth:authReducer
   
//     }
// })


// src/components/Store/store.jsx
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../auth/authSlice'; 

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export default store;