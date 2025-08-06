import axios from "axios"

// const API = axios.create({ baseURL: "https://qr-scanner-server.onrender.com" })

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL })

export const addProduct = (productData) => API.post("/product", productData)
export const fetchProducts = () => API.get("/product")
// export const getProductByBarcode = (barcode) => API.get(`/product/${barcode}`);
export const getProductByBarcode = (barcode) => API.post(`/cart/add/${barcode}`)

export const deleteProduct = (id) => API.delete(`/product/${id}`)

export const addProductToCart = (productId) => API.post(`/cart/add/${productId}`)

export const Registration= ()=>API.post("/register")
export const fetchRegistration= ()=>API.get("/display")

// Category and subcategory endpoints
export const fetchcategory = () => API.get("/category")
export const addCategory = (name) => API.post("/category", { name })
export const updateCategory = (id, name) => API.put(`/category/${id}`, { name })
export const deleteCategory = (id) => API.delete(`/category/${id}`)

export const fetchSubcategory = (categoryId) =>
  categoryId ? API.get(`/subcategory?categoryId=${categoryId}`) : API.get("/subcategory");
export const addSubCategory = (data) => API.post("/subcategory", data)
export const updateSubCategory = (id, data) => API.put(`/subcategory/${id}`, data)
export const deleteSubCategory = (id) => API.delete(`/subcategory/${id}`)




export const getProductByBarcodes = async (barcode) => API.get(`products/barcode/${barcode}`);


export const scanProduct = async (barcodeData) =>  API.put(`${API_URL}/purchase/scan`, barcodeData);



