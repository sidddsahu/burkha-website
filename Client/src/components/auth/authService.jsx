import axios from "axios";
import { base_url } from "../../pages/utils/base_url";

const register = async (userData) => {
    try {
        const response = await axios.post(`${base_url}user/register`, userData);
        if (response.data) {
            localStorage.setItem('user', JSON.stringify(response.data)); // Use the same key for consistency
        }
        return response.data;
    } catch (error) {
        // Handle error and throw it for further handling
        if (error.response && error.response.data) {
            throw new Error(error.response.data.message || "Registration failed");
        } else {
            throw new Error("Registration failed");
        }
    }
};

const login = async (userData) => {
  try {
      const response = await axios.post(`${base_url}user/login`, userData);
      if (response.data) {
          localStorage.setItem('user', JSON.stringify(response.data)); // Consistent key
      }
      return response.data;
  } catch (error) {
      // Handle error and return a serializable object
      if (error.response && error.response.data) {
          return { error: error.response.data.message || "Login failed" };
      } else {
          return { error: "Login failed" };
      }
  }
};


const getOrders = async ()=>{
    const response = await axios.get(`${base_url}user/getallorders`,config)
    return response.data
}

const getSingleOrder = async (id) => {
    const response = await axios.get(
      `${base_url}user/getSingleOrder/${id}`,
      config
    );
  
    return response.data;
  };

  const updateOrder = async (data) => {
    const response = await axios.put(
      `${base_url}user/update-order/${data.id}`,{status:data.status},
      config
    );
  
    return response.data;
  };

  const getMonthlyOrderDetails = async (id) => {
    const response = await axios.get(
      `${base_url}user/getMonthWiseOrderDetails`,
      config
    );
  
    return response.data;
  };

  const getYearlyStats = async (id) => {
    const response = await axios.get(
      `${base_url}user/getYearlyTotalOrders`,
      config
    );
  
    return response.data;
  };

const authService = { register, login,getOrders,getSingleOrder,getMonthlyOrderDetails,getYearlyStats,updateOrder };

export default authService;