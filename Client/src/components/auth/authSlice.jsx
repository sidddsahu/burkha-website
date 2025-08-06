// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import authService from "./authService";
// import { toast } from "react-toastify";

// const getUserFromLocalStorage = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

// const initialState = {
//     user: getUserFromLocalStorage,
//     orders: [],
//     isError: false,
//     isLoading: false,
//     isSuccess: false,
//     message: ""
// };

// export const login = createAsyncThunk('auth/admin-login', async (user, thunkApi) => {
//     try {
//         return await authService.login(user);
//     } catch (err) {
//         return thunkApi.rejectWithValue(err);
//     }
// });

// export const registerUser  = createAsyncThunk('auth/user-register', async (user, thunkApi) => {
//     try {
//         return await authService.register(user);
//     } catch (err) {
//         return thunkApi.rejectWithValue(err);
//     }
// });

// export const authSlice = createSlice({
//     name: "auth",
//     initialState,
//     reducers: {},
//     extraReducers: (builder) => {
//         builder
//             .addCase(registerUser .pending, (state) => {
//                 state.isLoading = true;
//             })
//             .addCase(registerUser .fulfilled, (state, action) => {
//                 state.isLoading = false;
//                 state.isSuccess = true;
//                 state.createdUser  = action.payload;
//                 toast.info("User  Created");
//             })
//             .addCase(registerUser .rejected, (state, action) => {
//                 state.isLoading = false;
//                 state.isError = true;
//                 state.isSuccess = false;
//                 state.user = null;
//                 console.log(action);
//                 toast.error(action.payload.response.data.message);
//             })
//             .addCase(login.pending, (state) => {
//                 state.isLoading = true;
//             })
//             .addCase(login.fulfilled, (state, action) => {
//                 state.isLoading = false;
//                 state.isSuccess = true;
//                 state.user = action.payload;
//                 localStorage.setItem('user', JSON.stringify(action.payload)); // Save user to local storage
//                 toast.success("Login Successful");
//             })
//             .addCase(login.rejected, (state, action) => {
//                 state.isLoading = false;
//                 state.isError = true;
//                 state.isSuccess = false;
//                 state.user = null;
//                 toast.error(action.payload.response.data.message || "Login failed");
//             });
//     }
// });

// export default authSlice.reducer;
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import authService from "./authService";
import { toast } from "react-toastify";

const getUserFromLocalStorage = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

const initialState = {
    user: getUserFromLocalStorage,
    orders: [],
    singleOrder: null,
    monthlyOrderDetails: null,
    yearlyOrderDetails: null,
    isError: false,
    isLoading: false,
    isSuccess: false,
    message: ""
};

// Async Thunks
export const login = createAsyncThunk('auth/admin-login', async (user, thunkApi) => {
    try {
        return await authService.login(user);
    } catch (err) {
        return thunkApi.rejectWithValue(err);
    }
});

export const registerUser  = createAsyncThunk('auth/user-register', async (user, thunkApi) => {
    try {
        return await authService.register(user);
    } catch (err) {
        return thunkApi.rejectWithValue(err);
    }
});

export const getOrders = createAsyncThunk('order/get-orders', async (_, thunkApi) => {
    try {
        return await authService.getOrders();
    } catch (err) {
        return thunkApi.rejectWithValue(err);
    }
});

export const getSingleOrder = createAsyncThunk('order/get-order', async (id, thunkApi) => {
    try {
        return await authService.getSingleOrder(id);
    } catch (err) {
        return thunkApi.rejectWithValue(err);
    }
});

export const updateOrder = createAsyncThunk('order/update-order', async (data, thunkApi) => {
    try {
        return await authService.updateOrder(data);
    } catch (err) {
        return thunkApi.rejectWithValue(err);
    }
});

export const getMonthlyOrderDetails = createAsyncThunk('order/get-monthlyOrderDetails', async (_, thunkApi) => {
    try {
        return await authService.getMonthlyOrderDetails();
    } catch (err) {
        return thunkApi.rejectWithValue(err);
    }
});

export const getYearlyStats = createAsyncThunk('order/get-yearlyStats', async (_, thunkApi) => {
    try {
        return await authService.getYearlyStats();
    } catch (err) {
        return thunkApi.rejectWithValue(err);
    }
});

// Slice
export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(registerUser .pending, (state) => {
                state.isLoading = true;
            })
            .addCase(registerUser .fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload; // Assuming the payload contains user info
                toast.info("User  Created");
            })
            .addCase(registerUser .rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.isSuccess = false;
                const errorMessage = action.payload?.response?.data?.message || "Registration failed";
                toast.error(errorMessage);
            })
            .addCase(login.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload;
                localStorage.setItem('user', JSON.stringify(action.payload)); // Save user to local storage
                toast.success("Login Successful");
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.isSuccess = false;
                const errorMessage = action.payload?.response?.data?.message || "Login failed";
                toast.error(errorMessage);
            })
            .addCase(getOrders.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getOrders.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.orders = action.payload;
            })
            .addCase(getOrders.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.isSuccess = false;
                const errorMessage = action.payload?.response?.data?.message || "Failed to fetch orders";
                toast.error(errorMessage);
            })
            .addCase(getSingleOrder.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getSingleOrder.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.singleOrder = action.payload;
            })
            .addCase(getSingleOrder.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.isSuccess = false;
                const errorMessage = action.payload?.response?.data?.message || "Failed to fetch order details";
                toast.error(errorMessage);
            })
            .addCase(getMonthlyOrderDetails.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getMonthlyOrderDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.monthlyOrderDetails = action.payload;
            })
            .addCase(getMonthlyOrderDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.isSuccess = false;
                const errorMessage = action.payload?.response?.data?.message || "Failed to fetch monthly order details";
                toast.error(errorMessage);
            })
            .addCase(getYearlyStats.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getYearlyStats.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.yearlyOrderDetails = action.payload;
            })
            .addCase(getYearlyStats.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.isSuccess = false;
                const errorMessage = action.payload?.response?.data?.message || "Failed to fetch yearly stats";
                toast.error(errorMessage);
            })
            .addCase(updateOrder.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateOrder.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                // Assuming the payload contains the updated order
                const updatedOrderIndex = state.orders.findIndex(order => order.id === action.payload.id);
                if (updatedOrderIndex !== -1) {
                    state.orders[updatedOrderIndex] = action.payload;
                }
                toast.success("Order updated successfully");
            })
            .addCase(updateOrder.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.isSuccess = false;
                const errorMessage = action.payload?.response?.data?.message || "Failed to update order";
                toast.error(errorMessage);
            });
    }
});

export default authSlice.reducer;