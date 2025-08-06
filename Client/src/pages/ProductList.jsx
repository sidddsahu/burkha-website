// "use client"

// import { useEffect, useState } from "react"
// import { deleteProduct, fetchProducts } from "../api"
// import { Package, Search, RefreshCw, Trash2, ShoppingCart, Tag, Info, Edit, Printer, X } from "lucide-react"
// import { useCart } from "../CartContext"
// import { useNavigate } from "react-router-dom"

// const ProductList = () => {
//   const [products, setProducts] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [searchTerm, setSearchTerm] = useState("")
//   const { fetchCart } = useCart()
//   const [addingToCart, setAddingToCart] = useState({})
//   const [selectedProduct, setSelectedProduct] = useState(null)
//   const [editingProduct, setEditingProduct] = useState(null)
//   const [editFormData, setEditFormData] = useState({
//     name: "",
//     price: "",
//     mrp: "",
//     description: "",
//     color: "",
//     fabric: "",
//     size: [],
//     category: "",
//     subCategory: "",
//     stock: ""
//   })
//   const [printQuantity, setPrintQuantity] = useState(1)
//   const [stickersPerPage, setStickersPerPage] = useState(4)
//   const [showPrintDialog, setShowPrintDialog] = useState(false)
//   const [productToPrint, setProductToPrint] = useState(null)

//   const navigate = useNavigate()

//   const Quantity = () => {
//     navigate("/purchaseproduct")
//   }

//   const loadProducts = async () => {
//     setLoading(true)
//     setError(null)
//     try {
//       const res = await fetchProducts()
//       setProducts(res.data)
//     } catch (err) {
//       console.error("Failed to fetch products:", err)
//       setError("Failed to load products. Please try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const deleteP = async (id) => {
//     const res = await deleteProduct(id)
//     if (res.data) {
//       setProducts(res.data.data)
//     }
//   }

//   const updateProduct = async (id, updatedData) => {
//     try {
//       const response = await fetch(`${import.meta.env.VITE_API_URL}/product/${id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(updatedData),
//       })

//       if (!response.ok) {
//         throw new Error("Failed to update product")
//       }

//       const updatedProduct = await response.json()
//       setProducts(products.map(product =>
//         product._id === id ? updatedProduct : product
//       ))
//       setEditingProduct(null)
//       return true
//     } catch (error) {
//       console.error("Error updating product:", error)
//       return false
//     }
//   }

//   const handleEditSubmit = async (e) => {
//     e.preventDefault()
//     const success = await updateProduct(editingProduct._id, editFormData)
//     if (success) {
//       setEditingProduct(null)
//     }
//   }

//   const handlePrintProduct = (product) => {
//     setProductToPrint(product)
//     setShowPrintDialog(true)
//   }

//   const handleToggle = async (id, checked) => {
//     const newStatus = !checked;
//     try {
//       await axios.put(`https://backend.umairabaya.com/product/${id}/home-visibility`, { homeVisibility: newStatus });
//       fetchCourses();
//       toast.success('Visibility updated successfully');
//     } catch (error) {
//       toast.error('Error updating visibility');
//       console.error('Error updating visibility:', error);
//     }
//   };

//   const changeStatus = async (id, homeVisibility) => {
//     const confirmToggle = window.confirm("Are you sure you want to change the visibility of this course?");
//     if (!confirmToggle) return;

//     try {
//       await handleToggle(id, homeVisibility);
//     } catch (err) {
//       console.error("Failed to update course visibility:", err);
//       toast.error("Failed to update course visibility. Please try again.");
//     }
//   };

//   const confirmPrint = () => {
//     if (!productToPrint || printQuantity < 1) return

//     const printDate = new Date().toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric'
//     })

//     const stickersPerPageCount = Math.min(Math.max(1, stickersPerPage), 8)
//     const totalPages = Math.ceil(printQuantity / stickersPerPageCount)

//     let printableContent = ''

//     for (let page = 0; page < totalPages; page++) {
//       printableContent += `
//         <div style="
//           display: grid;
//           grid-template-columns: repeat(${Math.min(stickersPerPageCount, 2)}, 1fr);
//           gap: 10px;
//           padding: 10px;
//           ${page < totalPages - 1 ? 'page-break-after: always;' : ''}
//         ">
//       `

//       const stickersOnThisPage = Math.min(
//         stickersPerPageCount,
//         printQuantity - (page * stickersPerPageCount)
//       )

//       for (let i = 0; i < stickersOnThisPage; i++) {
//         printableContent += `
//           <div style="
//             width: 100%;
//             height: 100%;
//             padding: 10px;
//             border: 2px solid #000;
//             font-family: Arial, sans-serif;
//             background: white;
//             box-sizing: border-box;
//           ">
//             <div style="text-align: center; margin-bottom: 8px;">
//               <div style="font-weight: bold; font-size: 18px; display: flex; justify-content: space-between;">
//                 <span>MRP</span>
//                 <span style="font-size: 20px;">₹${Number(productToPrint.price).toFixed(2)}</span>
//               </div>
//               ${productToPrint.mrp && productToPrint.mrp > productToPrint.price ? `
//                 <div style="font-size: 12px; text-decoration: line-through; color: #666;">
//                   MRP: ₹${Number(productToPrint.mrp).toFixed(2)}
//                 </div>
//               ` : ''}
//               <div style="font-size: 10px; margin-top: 3px;">
//                 Inclusive of All Taxes
//               </div>
//             </div>

//             <hr style="border: 1px solid #000; margin: 5px 0;" />

//             <div style="margin-bottom: 8px;">
//               <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 3px;">
//                 <span>Item No: <strong>${productToPrint._id.slice(-6).toUpperCase()}</strong></span>
//                 <span>Type: <strong>${productToPrint.category?.name || 'N/A'}</strong></span>
//               </div>
//               <div style="font-size: 14px; font-weight: bold; margin-bottom: 3px; text-align: center;">
//                 ${productToPrint.name}
//               </div>
//               <div style="display: flex; justify-content: space-between; font-size: 12px;">
//                 <span>Size: <strong>${productToPrint.size?.join(', ') || 'N/A'}</strong></span>
//                 <span>Color: <strong>${productToPrint.color || 'N/A'}</strong></span>
//               </div>
//               ${productToPrint.fabric ? `
//                 <div style="font-size: 12px; margin-top: 3px;">
//                   Fabric: <strong>${productToPrint.fabric}</strong>
//                 </div>
//               ` : ''}
//             </div>

//             <div style="text-align: center; margin: 5px 0;">
//               ${productToPrint.barcode ? `
//                 <img
//                   src="${productToPrint.barcode}"
//                   alt="Barcode"
//                   style="width: 100%; height: 40px; object-fit: contain;"
//                 />
//               ` : `
//                 <div style="height: 40px; display: flex; align-items: center; justify-content: center; color: #666;">
//                   [Barcode Not Available]
//                 </div>
//               `}
//               <div style="letter-spacing: 2px; text-align: center; font-family: monospace; margin-top: 3px; font-size: 10px;">
//                 ${productToPrint._id.slice(-6).toUpperCase()}
//               </div>
//             </div>

//             <div style="text-align: center; margin-top: 5px;">
//               <div style="font-size: 16px; font-weight: bold; margin-bottom: 3px;">
//                 BURKA COLLECTION
//               </div>
//               <div style="font-size: 10px; line-height: 1.2;">
//                 Printed on: ${printDate}<br/>
//                 Customer Care: +91 1234567890<br/>
//                 Address- Ghetal gali Sironj disit vidhisha
//               </div>
//             </div>
//           </div>
//         `
//       }

//       printableContent += `</div>`
//     }

//     const printWindow = window.open('', '_blank')
//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>${productToPrint.name} - Price Tags (${printQuantity} copies)</title>
//           <style>
//             @page {
//               size: A4;
//               margin: 0;
//             }
//             @media print {
//               body {
//                 margin: 0;
//                 padding: 0;
//                 width: 210mm;
//                 height: 297mm;
//               }
//             }
//           </style>
//         </head>
//         <body onload="window.print(); window.close();">
//           ${printableContent}
//         </body>
//       </html>
//     `)
//     printWindow.document.close()

//     setShowPrintDialog(false)
//     setProductToPrint(null)
//     setPrintQuantity(1)
//   }

//   useEffect(() => {
//     loadProducts()
//   }, [])

//   useEffect(() => {
//     if (editingProduct) {
//       setEditFormData({
//         name: editingProduct.name || "",
//         price: editingProduct.price || "",
//         mrp: editingProduct.mrp || "",
//         description: editingProduct.description || "",
//         color: editingProduct.color || "",
//         fabric: editingProduct.fabric || "",
//         size: editingProduct.size || [],
//         category: editingProduct.category?._id || "",
//         subCategory: editingProduct.subCategory?._id || "",
//         stock: editingProduct.stock || ""
//       })
//     }
//   }, [editingProduct])

//   const filteredProducts = products.filter((product) =>
//     product.name.toLowerCase().includes(searchTerm.toLowerCase())
//   )

//   const addToCart = async (productId, quantity = 1) => {
//     const product = products.find(p => p._id === productId)
//     if (!product || product.stock <= 0) {
//       return
//     }

//     setAddingToCart((prev) => ({ ...prev, [productId]: true }))
//     try {
//       await fetch(`${import.meta.env.VITE_API_URL}/cart/add/${productId}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ quantity }),
//       })
//       await fetchCart()
//     } catch (err) {
//       console.error("Failed to add product to cart:", err)
//       setError("Failed to add product to cart.")
//     } finally {
//       setAddingToCart((prev) => ({ ...prev, [productId]: false }))
//     }
//   }

//   const handleAddToCartClick = (product) => {
//     if (product.stock <= 0) return
//     addToCart(product._id, 1)
//   }

//   return (
//     <div className="bg-white shadow rounded-lg max-w-5xl py-8">
//       {showPrintDialog && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg p-6 max-w-md w-full">
//             <div className="flex justify-between items-start mb-4">
//               <h2 className="text-xl font-bold">Print Price Tags</h2>
//               <button onClick={() => setShowPrintDialog(false)} className="text-gray-500 hover:text-gray-700">
//                 <X size={24} />
//               </button>
//             </div>

//             <div className="mb-4">
//               <p className="text-gray-700 mb-2">Enter quantity to print for:</p>
//               <p className="font-medium text-lg">{productToPrint?.name}</p>
//             </div>

//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Number of Copies</label>
//               <input
//                 type="number"
//                 min="1"
//                 value={printQuantity}
//                 onChange={(e) => setPrintQuantity(Math.max(1, parseInt(e.target.value) || 1))}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
//               />
//             </div>

//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Stickers Per Page</label>
//               <select
//                 value={stickersPerPage}
//                 onChange={(e) => setStickersPerPage(parseInt(e.target.value))}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md"
//               >
//                 <option value="1">1 per page</option>
//                 <option value="2">2 per page</option>
//                 <option value="4">4 per page</option>
//                 <option value="6">6 per page</option>
//                 <option value="8">8 per page</option>
//               </select>
//             </div>

//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setShowPrintDialog(false)}
//                 className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmPrint}
//                 className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md flex items-center"
//               >
//                 <Printer size={18} className="mr-2" />
//                 Print {printQuantity} {printQuantity === 1 ? 'Copy' : 'Copies'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//         <h2 className="text-xl font-bold text-gray-800 flex items-center">
//           <Package className="mr-2" size={24} />
//           Product List
//         </h2>
//         <button
//           onClick={loadProducts}
//           className="p-2 text-gray-500 hover:text-primary-600 focus:outline-none"
//           title="Refresh products"
//         >
//           <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
//         </button>
//       </div>
//       <div className="p-4 border-b border-gray-200">
//         <div className="relative">
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             <Search size={18} className="text-gray-400" />
//           </div>
//           <input
//             type="text"
//             placeholder="Search products..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//           />
//         </div>
//       </div>

//       {loading ? (
//         <div className="flex justify-center items-center p-8">
//           <RefreshCw size={24} className="animate-spin text-primary-600" />
//           <span className="ml-2 text-gray-600">Loading products...</span>
//         </div>
//       ) : error ? (
//         <div className="p-8 text-center text-red-600">{error}</div>
//       ) : filteredProducts.length === 0 ? (
//         <div className="p-8 text-center text-gray-500">
//           {searchTerm ? "No products match your search." : "No products available."}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
//           {filteredProducts.map((product) => (
//             <div
//               key={product._id}
//               className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
//             >
//               <div className="relative">
//                 <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
//                   {product.images && product.images.length > 0 ? (
//                     <img
//                       src={product.images[0] || "/placeholder.svg"}
//                       alt={product.name}
//                       className="h-[100%]"
//                     />
//                   ) : (
//                     <div className="text-gray-400 flex flex-col items-center">
//                       <Package size={48} />
//                       <span className="text-sm mt-2">No image</span>
//                     </div>
//                   )}
//                 </div>

//                 {product.mrp && product.price && product.mrp > product.price && (
//                   <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
//                     {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
//                   </div>
//                 )}
//               </div>

//               <div className="p-4">
//                 <div className="flex justify-between items-start mb-2">
//                   <div className="flex space-x-1">
//                     <button
//                       className={`p-1.5 rounded-full ${
//                         product.stock <= 0
//                           ? "bg-gray-200 cursor-not-allowed"
//                           : addingToCart[product._id]
//                           ? "bg-gray-200"
//                           : "bg-primary-50 hover:bg-primary-100"
//                       }`}
//                       onClick={() => handleAddToCartClick(product)}
//                       disabled={product.stock <= 0 || addingToCart[product._id]}
//                       title={product.stock <= 0 ? "Out of Stock" : "Add to cart"}
//                     >
//                       {addingToCart[product._id] ? (
//                         <RefreshCw size={16} className="text-primary-600 animate-spin" />
//                       ) : (
//                         <ShoppingCart size={16} className={product.stock <= 0 ? "text-gray-400" : "text-primary-600"} />
//                       )}
//                     </button>
//                     <button
//                       className="p-1.5 rounded-full bg-green-50 hover:bg-green-100"
//                       onClick={() => handlePrintProduct(product)}
//                       title="Print product details"
//                     >
//                       <Printer size={16} className="text-green-600" />
//                     </button>
//                     <button
//                       className="p-1.5 rounded-full bg-yellow-50 hover:bg-yellow-100"
//                       onClick={() => setEditingProduct(product)}
//                       title="Edit product"
//                     >
//                       <Edit size={16} className="text-yellow-600" />
//                     </button>
//                     <button
//                       className="p-1.5 rounded-full bg-red-50 hover:bg-red-100"
//                       onClick={() => deleteP(product._id)}
//                       title="Delete product"
//                     >
//                       <Trash2 size={16} className="text-red-600" />
//                     </button>
//                     <button
//                       className="p-1.5 rounded-full bg-blue-50 hover:bg-blue-100"
//                       onClick={() => setSelectedProduct(product)}
//                       title="View details"
//                     >
//                       <Info size={16} className="text-blue-600" />
//                     </button>
//                   </div>
//                 </div>
//                 <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
//                 <div className="flex items-baseline mb-2">
//                   <span className="text-primary-600 font-bold text-lg">
//                     ₹{Number.parseFloat(product.price).toFixed(2)}
//                   </span>
//                   {product.mrp && product.mrp > product.price && (
//                     <span className="ml-2 text-gray-500 text-sm line-through">
//                       ₹{Number.parseFloat(product.mrp).toFixed(2)}
//                     </span>
//                   )}
//                 </div>

//                 <div className="mb-2">
//                   {product.stock > 0 ? (
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 animate-pulse">
//                       <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-ping"></span>
//                       {product.stock} in Stock
//                     </span>
//                   ) : (
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
//                       Sold Out
//                     </span>
//                   )}
//                 </div>

//                 <div className="flex flex-wrap gap-1 mb-2">
//                   {product.category && (
//                     <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 text-black">
//                       <Tag size={12} className="mr-1" />
//                       {product.category.name}
//                     </span>
//                   )}

//                   {product.size && product.size.length > 0 && (
//                     <div className="flex gap-1 ml-auto">
//                       {product.size.map((size) => (
//                         <span key={size} className="inline-block px-1.5 py-0.5 text-xs border border-gray-300 rounded text-black">
//                           {size}
//                         </span>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 {(product.color || product.fabric) && (
//                   <div className="text-sm text-gray-600 mb-2">
//                     {product.color && <span>{product.color}</span>}
//                     {product.color && product.fabric && <span> • </span>}
//                     {product.fabric && <span>{product.fabric}</span>}
//                   </div>
//                 )}

//                 {product.description && <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>}
//               </div>

//               {product.barcode && (
//                 <div className="bg-gray-50 p-2 flex justify-center border-t border-gray-200">
//                   <img
//                     src={product.barcode || "/placeholder.svg"}
//                     alt={`QR Code for ${product.name}`}
//                     className="h-24 w-96 object-contain scale-2"
//                   />
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}

//       {selectedProduct && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6">
//               <div className="flex justify-between items-start mb-4">
//                 <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
//                 <button onClick={() => setSelectedProduct(null)} className="text-gray-500 hover:text-gray-700">
//                   <X size={24} />
//                 </button>
//               </div>

//               {selectedProduct.images && selectedProduct.images.length > 0 ? (
//                 <div className="grid grid-cols-4 gap-2 mb-6">
//                   <div className="col-span-4 h-64 bg-gray-100 rounded-lg overflow-hidden">
//                     <img
//                       src={selectedProduct.images[0] || "/placeholder.svg"}
//                       alt={selectedProduct.name}
//                       className="w-full h-full object-contain"
//                     />
//                   </div>
//                   {selectedProduct.images.slice(1).map((image, index) => (
//                     <div key={index} className="h-16 bg-gray-100 rounded-lg overflow-hidden">
//                       <img
//                         src={image || "/placeholder.svg"}
//                         alt={`${selectedProduct.name} ${index + 2}`}
//                         className="w-full h-full object-cover"
//                       />
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
//                   <div className="text-gray-400 flex flex-col items-center">
//                     <Package size={64} />
//                     <span className="text-sm mt-2">No images available</span>
//                   </div>
//                 </div>
//               )}

//               <div className="flex items-baseline mb-4">
//                 <span className="text-primary-600 font-bold text-2xl">
//                   ₹{Number.parseFloat(selectedProduct.price).toFixed(2)}
//                 </span>
//                 {selectedProduct.mrp && selectedProduct.mrp > selectedProduct.price && (
//                   <>
//                     <span className="ml-2 text-gray-500 text-lg line-through">
//                       ₹{Number.parseFloat(selectedProduct.mrp).toFixed(2)}
//                     </span>
//                     <span className="ml-2 bg-red-100 text-red-800 text-sm font-medium px-2 py-0.5 rounded">
//                       {Math.round(((selectedProduct.mrp - selectedProduct.price) / selectedProduct.mrp) * 100)}% OFF
//                     </span>
//                   </>
//                 )}
//               </div>

//               <div className="mb-4">
//                 {selectedProduct.stock > 0 ? (
//                   <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 animate-pulse">
//                     <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-ping"></span>
//                     {selectedProduct.stock} in Stock
//                   </span>
//                 ) : (
//                   <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
//                     Sold Out
//                   </span>
//                 )}
//               </div>

//               <div className="grid grid-cols-2 gap-4 mb-6">
//                 {selectedProduct.category && (
//                   <div>
//                     <h3 className="text-sm text-gray-500">Category</h3>
//                     <p className="text-black">{selectedProduct.category.name}</p>
//                   </div>
//                 )}

//                 {selectedProduct.subCategory && (
//                   <div>
//                     <h3 className="text-sm text-gray-500">Sub-Category</h3>
//                     <p className="text-black">{selectedProduct.subCategory.name}</p>
//                   </div>
//                 )}

//                 {selectedProduct.color && (
//                   <div>
//                     <h3 className="text-sm text-gray-500">Color</h3>
//                     <p className="text-black">{selectedProduct.color}</p>
//                   </div>
//                 )}

//                 {selectedProduct.fabric && (
//                   <div>
//                     <h3 className="text-sm text-gray-500">Fabric</h3>
//                     <p className="text-black">{selectedProduct.fabric}</p>
//                   </div>
//                 )}

//                 {selectedProduct.size && selectedProduct.size.length > 0 && (
//                   <div>
//                     <h3 className="text-sm text-gray-500">Available Sizes</h3>
//                     <div className="flex gap-2 mt-1">
//                       {selectedProduct.size.map((size) => (
//                         <span key={size} className="inline-block px-2 py-1 border border-gray-300 rounded text-black">
//                           {size}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {selectedProduct.description && (
//                 <div className="mb-6">
//                   <h3 className="text-lg font-medium mb-2 text-black">Description</h3>
//                   <p className="text-gray-600">{selectedProduct.description}</p>
//                 </div>
//               )}

//               <div className="flex gap-3">
//                 <button
//                   onClick={() => handleAddToCartClick(selectedProduct)}
//                   className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center text-white ${
//                     selectedProduct.stock <= 0
//                       ? "bg-gray-400 cursor-not-allowed"
//                       : "bg-primary-600 hover:bg-primary-700"
//                   }`}
//                   disabled={selectedProduct.stock <= 0}
//                 >
//                   <ShoppingCart size={18} className="mr-2" />
//                   {selectedProduct.stock <= 0 ? "Out of Stock" : "Add to Cart"}
//                 </button>
//                 <button
//                   onClick={() => {
//                     setEditingProduct(selectedProduct)
//                     setSelectedProduct(null)
//                   }}
//                   className="bg-yellow-50 hover:bg-yellow-100 text-yellow-600 py-2 px-4 rounded-md flex items-center justify-center"
//                 >
//                   <Edit size={18} className="mr-2" />
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => {
//                     deleteP(selectedProduct._id)
//                     setSelectedProduct(null)
//                   }}
//                   className="bg-red-50 hover:bg-red-100 text-red-600 py-2 px-4 rounded-md flex items-center justify-center"
//                 >
//                   <Trash2 size={18} className="mr-2" />
//                   Delete
//                 </button>
//                 <button
//                   onClick={() => {
//                     handlePrintProduct(selectedProduct)
//                     setSelectedProduct(null)
//                   }}
//                   className="bg-green-50 hover:bg-green-100 text-green-600 py-2 px-4 rounded-md flex items-center justify-center"
//                 >
//                   <Printer size={18} className="mr-2" />
//                   Print
//                 </button>
//                  <button
//           onClick={() => changeStatus(selectedProduct._id, selectedProduct.homeVisibility)}
//           className={`flex items-center gap-1 text-sm px-3 py-1 rounded transition-colors ${
//             row.homeVisibility
//               ? 'bg-green-100 hover:bg-green-200 text-green-800'
//               : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
//           }`}
//           title={row.homeVisibility ? 'Visible on home' : 'Hidden from home'}
//         >
//           <FiHome size={14} />
//           {row.homeVisibility ? 'Visible' : 'Hidden'}
//         </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {editingProduct && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6">
//               <div className="flex justify-between items-start mb-4">
//                 <h2 className="text-2xl font-bold">Edit Product</h2>
//                 <button onClick={() => setEditingProduct(null)} className="text-gray-500 hover:text-gray-700">
//                   <X size={24} />
//                 </button>
//               </div>

//               <form onSubmit={handleEditSubmit}>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//                   <div className="col-span-2">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
//                     <input
//                       type="text"
//                       value={editFormData.name}
//                       onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
//                     <input
//                       type="number"
//                       value={editFormData.price}
//                       onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                       required
//                     />
//                   </div>


//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
//                     <input
//                       type="number"
//                       value={editFormData.stock}
//                       onChange={(e) => setEditFormData({...editFormData, stock: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                       required
//                       min="0"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
//                     <input
//                       type="text"
//                       value={editFormData.color}
//                       onChange={(e) => setEditFormData({...editFormData, color: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Fabric</label>
//                     <input
//                       type="text"
//                       value={editFormData.fabric}
//                       onChange={(e) => setEditFormData({...editFormData, fabric: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                     />
//                   </div>

//                   <div className="col-span-2">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Sizes (comma separated)</label>
//                     <input
//                       type="text"
//                       value={editFormData.size.join(",")}
//                       onChange={(e) => setEditFormData({...editFormData, size: e.target.value.split(",").map(s => s.trim())})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                     />
//                   </div>

//                   <div className="col-span-2">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//                     <textarea
//                       value={editFormData.description}
//                       onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                       rows={3}
//                     />
//                   </div>
//                 </div>

//                 <div className="flex gap-3">
//                   <button
//                     type="submit"
//                     className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md"
//                   >
//                     Save Changes
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setEditingProduct(null)}
//                     className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default ProductList


"use client"

import { useEffect, useState } from "react"
import { deleteProduct, fetchProducts } from "../api"
import { Package, Search, RefreshCw, Trash2, ShoppingCart, Tag, Info, Edit, Printer, X, Home } from "lucide-react"
import { useCart } from "../CartContext"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"

const ProductList = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { fetchCart } = useCart()
  const [addingToCart, setAddingToCart] = useState({})
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editFormData, setEditFormData] = useState({
    name: "",
    price: "",
    mrp: "",
    description: "",
    color: "",
    fabric: "",
    size: [],
    category: "",
    subCategory: "",
    stock: "",
    homeVisibility: false
  })
  const [printQuantity, setPrintQuantity] = useState(1)
  const [stickersPerPage, setStickersPerPage] = useState(4)
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [productToPrint, setProductToPrint] = useState(null)

  const navigate = useNavigate()

  const Quantity = () => {
    navigate("/purchaseproduct")
  }

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchProducts()
      setProducts(res.data)
    } catch (err) {
      console.error("Failed to fetch products:", err)
      setError("Failed to load products. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const deleteP = async (id) => {
    const res = await deleteProduct(id)
    if (res.data) {
      setProducts(res.data.data)
    }
  }

  const updateProduct = async (id, updatedData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/product/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      })

      if (!response.ok) {
        throw new Error("Failed to update product")
      }

      const updatedProduct = await response.json()
      setProducts(products.map(product =>
        product._id === id ? updatedProduct : product
      ))
      setEditingProduct(null)
      return true
    } catch (error) {
      console.error("Error updating product:", error)
      return false
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    const success = await updateProduct(editingProduct._id, editFormData)
    if (success) {
      setEditingProduct(null)
      toast.success("Product updated successfully")
    } else {
      toast.error("Failed to update product")
    }
  }

  const handlePrintProduct = (product) => {
    setProductToPrint(product)
    setShowPrintDialog(true)
  }

  // const toggleHomeVisibility = async (productId, currentVisibility) => {
  //   try {
  //     const response = await axios.put(`${import.meta.env.VITE_API_URL}/product/${productId}/home-visibility`, {
  //       homeVisibility: !currentVisibility
  //     })

  //     if (response.data.success) {
  //       setProducts(products.map(product =>
  //         product._id === productId
  //           ? { ...product, homeVisibility: !currentVisibility }
  //           : product
  //       ))
  //       console.log(setProducts,"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
  //       toast.success(`Product ${!currentVisibility ? 'added to' : 'removed from'} home page`)
  //     }
  //   } catch (error) {
  //     console.error("Error updating visibility:", error)
  //     toast.error("Failed to update visibility")
  //   }
  // }

// const toggleHomeVisibility = async (productId) => {
//   try {
//     const product = products.find(p => p._id === productId);
//     if (!product) {
//       toast.error("Product not found");
//       return;
//     }

//     const newVisibility = !product.homeVisibility;

//     const response = await axios.put(
//       `${import.meta.env.VITE_API_URL}/product/${productId}/home-visibility`,
//       { homeVisibility: newVisibility }
//     );

//     if (response.data.success) {
//       setProducts(prevProducts =>
//         prevProducts.map(p =>
//           p._id === productId ? { ...p, homeVisibility: newVisibility } : p
//         )
//       );
//       toast.success(`Product ${newVisibility ? 'added to' : 'removed from'} home page`);
//     } else {
//       toast.error("Server did not confirm the update");
//     }
//   } catch (error) {
//     console.error("Error updating visibility:", error);
//     toast.error("Failed to update visibility");
//   }
// };

const toggleHomeVisibility = async (productId) => {
  try {
    // Use latest product from the current state
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(product => {
        if (product._id === productId) {
          const newVisibility = !product.homeVisibility;

          // Call API with new visibility
          axios.put(
            `${import.meta.env.VITE_API_URL}/product/${productId}/home-visibility`,
            { homeVisibility: newVisibility }
          ).then((response) => {
            if (response.data.success) {
              toast.success(`Product ${newVisibility ? 'added to' : 'removed from'} home page`);
            } else {
              toast.error("Server did not confirm the update");
            }
          }).catch(error => {
            console.error("Error updating visibility:", error);
            toast.error("Failed to update visibility");
          });

          // Immediately update local state
          return { ...product, homeVisibility: newVisibility };
        }

        return product;
      });

      return updatedProducts;
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    toast.error("Something went wrong");
  }
};


  const confirmPrint = () => {
    if (!productToPrint || printQuantity < 1) return

    const printDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })

    const stickersPerPageCount = Math.min(Math.max(1, stickersPerPage), 8)
    const totalPages = Math.ceil(printQuantity / stickersPerPageCount)

    let printableContent = ''

    for (let page = 0; page < totalPages; page++) {
      printableContent += `
        <div style="
          display: grid;
          grid-template-columns: repeat(${Math.min(stickersPerPageCount, 2)}, 1fr);
          gap: 10px;
          padding: 10px;
          ${page < totalPages - 1 ? 'page-break-after: always;' : ''}
        ">
      `

      const stickersOnThisPage = Math.min(
        stickersPerPageCount,
        printQuantity - (page * stickersPerPageCount)
      )

      for (let i = 0; i < stickersOnThisPage; i++) {
        printableContent += `
          <div style="
            width: 100%;
            height: 100%;
            padding: 10px;
            border: 2px solid #000;
            font-family: Arial, sans-serif;
            background: white;
            box-sizing: border-box;
          ">
            <div style="text-align: center; margin-bottom: 8px;">
              <div style="font-weight: bold; font-size: 18px; display: flex; justify-content: space-between;">
                <span>MRP</span>
                <span style="font-size: 20px;">₹${Number(productToPrint.price).toFixed(2)}</span>
              </div>
              ${productToPrint.mrp && productToPrint.mrp > productToPrint.price ? `
                <div style="font-size: 12px; text-decoration: line-through; color: #666;">
                  MRP: ₹${Number(productToPrint.mrp).toFixed(2)}
                </div>
              ` : ''}
              <div style="font-size: 10px; margin-top: 3px;">
                Inclusive of All Taxes
              </div>
            </div>

            <hr style="border: 1px solid #000; margin: 5px 0;" />

            <div style="margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 3px;">
                <span>Item No: <strong>${productToPrint._id.slice(-6).toUpperCase()}</strong></span>
                <span>Type: <strong>${productToPrint.category?.name || 'N/A'}</strong></span>
              </div>
              <div style="font-size: 14px; font-weight: bold; margin-bottom: 3px; text-align: center;">
                ${productToPrint.name}
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 12px;">
                <span>Size: <strong>${productToPrint.size?.join(', ') || 'N/A'}</strong></span>
                <span>Color: <strong>${productToPrint.color || 'N/A'}</strong></span>
              </div>
              ${productToPrint.fabric ? `
                <div style="font-size: 12px; margin-top: 3px;">
                  Fabric: <strong>${productToPrint.fabric}</strong>
                </div>
              ` : ''}
            </div>

            <div style="text-align: center; margin: 5px 0;">
              ${productToPrint.barcode ? `
                <img
                  src="${productToPrint.barcode}"
                  alt="Barcode"
                  style="width: 100%; height: 40px; object-fit: contain;"
                />
              ` : `
                <div style="height: 40px; display: flex; align-items: center; justify-content: center; color: #666;">
                  [Barcode Not Available]
                </div>
              `}
              <div style="letter-spacing: 2px; text-align: center; font-family: monospace; margin-top: 3px; font-size: 10px;">
                ${productToPrint._id.slice(-6).toUpperCase()}
              </div>
            </div>

            <div style="text-align: center; margin-top: 5px;">
              <div style="font-size: 16px; font-weight: bold; margin-bottom: 3px;">
                BURKA COLLECTION
              </div>
              <div style="font-size: 10px; line-height: 1.2;">
                Printed on: ${printDate}<br/>
                Customer Care: +91 1234567890<br/>
                Address- Ghetal gali Sironj disit vidhisha
              </div>
            </div>
          </div>
        `
      }

      printableContent += `</div>`
    }

    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>${productToPrint.name} - Price Tags (${printQuantity} copies)</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
                width: 210mm;
                height: 297mm;
              }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${printableContent}
        </body>
      </html>
    `)
    printWindow.document.close()

    setShowPrintDialog(false)
    setProductToPrint(null)
    setPrintQuantity(1)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    if (editingProduct) {
      setEditFormData({
        name: editingProduct.name || "",
        price: editingProduct.price || "",
        mrp: editingProduct.mrp || "",
        description: editingProduct.description || "",
        color: editingProduct.color || "",
        fabric: editingProduct.fabric || "",
        size: editingProduct.size || [],
        category: editingProduct.category?._id || "",
        subCategory: editingProduct.subCategory?._id || "",
        stock: editingProduct.stock || "",
        homeVisibility: editingProduct.homeVisibility || false
      })
    }
  }, [editingProduct])

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addToCart = async (productId, quantity = 1) => {
    const product = products.find(p => p._id === productId)
    if (!product || product.stock <= 0) {
      return
    }

    setAddingToCart((prev) => ({ ...prev, [productId]: true }))
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/cart/add/${productId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      })
      await fetchCart()
      toast.success("Product added to cart")
    } catch (err) {
      console.error("Failed to add product to cart:", err)
      setError("Failed to add product to cart.")
      toast.error("Failed to add product to cart")
    } finally {
      setAddingToCart((prev) => ({ ...prev, [productId]: false }))
    }
  }

  const handleAddToCartClick = (product) => {
    if (product.stock <= 0) return
    addToCart(product._id, 1)
  }

  return (
    <div className="bg-white shadow rounded-lg max-w-5xl py-8">
      {showPrintDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Print Price Tags</h2>
              <button onClick={() => setShowPrintDialog(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 mb-2">Enter quantity to print for:</p>
              <p className="font-medium text-lg">{productToPrint?.name}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Copies</label>
              <input
                type="number"
                min="1"
                value={printQuantity}
                onChange={(e) => setPrintQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Stickers Per Page</label>
              <select
                value={stickersPerPage}
                onChange={(e) => setStickersPerPage(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="1">1 per page</option>
                <option value="2">2 per page</option>
                <option value="4">4 per page</option>
                <option value="6">6 per page</option>
                <option value="8">8 per page</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPrintDialog(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmPrint}
                className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md flex items-center"
              >
                <Printer size={18} className="mr-2" />
                Print {printQuantity} {printQuantity === 1 ? 'Copy' : 'Copies'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <Package className="mr-2" size={24} />
          Product List
        </h2>
        <button
          onClick={loadProducts}
          className="p-2 text-gray-500 hover:text-primary-600 focus:outline-none"
          title="Refresh products"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <RefreshCw size={24} className="animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Loading products...</span>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-600">{error}</div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          {searchTerm ? "No products match your search." : "No products available."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      className="h-[100%]"
                    />
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center">
                      <Package size={48} />
                      <span className="text-sm mt-2">No image</span>
                    </div>
                  )}
                </div>

                {product.mrp && product.price && product.mrp > product.price && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex space-x-1">
                    <button
                      className={`p-1.5 rounded-full ${
                        product.stock <= 0
                          ? "bg-gray-200 cursor-not-allowed"
                          : addingToCart[product._id]
                          ? "bg-gray-200"
                          : "bg-primary-50 hover:bg-primary-100"
                      }`}
                      onClick={() => handleAddToCartClick(product)}
                      disabled={product.stock <= 0 || addingToCart[product._id]}
                      title={product.stock <= 0 ? "Out of Stock" : "Add to cart"}
                    >
                      {addingToCart[product._id] ? (
                        <RefreshCw size={16} className="text-primary-600 animate-spin" />
                      ) : (
                        <ShoppingCart size={16} className={product.stock <= 0 ? "text-gray-400" : "text-primary-600"} />
                      )}
                    </button>
                    <button
                      className="p-1.5 rounded-full bg-green-50 hover:bg-green-100"
                      onClick={() => handlePrintProduct(product)}
                      title="Print product details"
                    >
                      <Printer size={16} className="text-green-600" />
                    </button>
                    <button
                      className="p-1.5 rounded-full bg-yellow-50 hover:bg-yellow-100"
                      onClick={() => setEditingProduct(product)}
                      title="Edit product"
                    >
                      <Edit size={16} className="text-yellow-600" />
                    </button>
                    <button
                      className="p-1.5 rounded-full bg-red-50 hover:bg-red-100"
                      onClick={() => deleteP(product._id)}
                      title="Delete product"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                    <button
                      className="p-1.5 rounded-full bg-blue-50 hover:bg-blue-100"
                      onClick={() => setSelectedProduct(product)}
                      title="View details"
                    >
                      <Info size={16} className="text-blue-600" />
                    </button>
                  </div>
                  <button
                    onClick={() => toggleHomeVisibility(product._id, product.homeVisibility)}
                    className={`p-1.5 rounded-full ${
                      product.homeVisibility
                        ? "bg-purple-100 hover:bg-purple-200 text-purple-600"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                    }`}
                    title={product.homeVisibility === "true" ? "Visible on home" : "Hidden from home"}
                  >
                    <Home size={16} />
                  </button>
                </div>
                <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                <div className="flex items-baseline mb-2">
                  <span className="text-primary-600 font-bold text-lg">
                    ₹{Number.parseFloat(product.price).toFixed(2)}
                  </span>
                  {product.mrp && product.mrp > product.price && (
                    <span className="ml-2 text-gray-500 text-sm line-through">
                      ₹{Number.parseFloat(product.mrp).toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="mb-2">
                  {product.stock > 0 ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 animate-pulse">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-ping"></span>
                      {product.stock} in Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      Sold Out
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  {product.category && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 text-black">
                      <Tag size={12} className="mr-1" />
                      {product.category.name}
                    </span>
                  )}

                  {product.size && product.size.length > 0 && (
                    <div className="flex gap-1 ml-auto">
                      {product.size.map((size) => (
                        <span key={size} className="inline-block px-1.5 py-0.5 text-xs border border-gray-300 rounded text-black">
                          {size}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {(product.color || product.fabric) && (
                  <div className="text-sm text-gray-600 mb-2">
                    {product.color && <span>{product.color}</span>}
                    {product.color && product.fabric && <span> • </span>}
                    {product.fabric && <span>{product.fabric}</span>}
                  </div>
                )}

                {product.description && <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>}
              </div>

              {product.barcode && (
                <div className="bg-gray-50 p-2 flex justify-center border-t border-gray-200">
                  <img
                    src={product.barcode || "/placeholder.svg"}
                    alt={`QR Code for ${product.name}`}
                    className="h-24 w-96 object-contain scale-2"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                <button onClick={() => setSelectedProduct(null)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                <div className="grid grid-cols-4 gap-2 mb-6">
                  <div className="col-span-4 h-64 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={selectedProduct.images[0] || "/placeholder.svg"}
                      alt={selectedProduct.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {selectedProduct.images.slice(1).map((image, index) => (
                    <div key={index} className="h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${selectedProduct.name} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                  <div className="text-gray-400 flex flex-col items-center">
                    <Package size={64} />
                    <span className="text-sm mt-2">No images available</span>
                  </div>
                </div>
              )}

              <div className="flex items-baseline mb-4">
                <span className="text-primary-600 font-bold text-2xl">
                  ₹{Number.parseFloat(selectedProduct.price).toFixed(2)}
                </span>
                {selectedProduct.mrp && selectedProduct.mrp > selectedProduct.price && (
                  <>
                    <span className="ml-2 text-gray-500 text-lg line-through">
                      ₹{Number.parseFloat(selectedProduct.mrp).toFixed(2)}
                    </span>
                    <span className="ml-2 bg-red-100 text-red-800 text-sm font-medium px-2 py-0.5 rounded">
                      {Math.round(((selectedProduct.mrp - selectedProduct.price) / selectedProduct.mrp) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4 mb-4">
                {selectedProduct.stock > 0 ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 animate-pulse">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-ping"></span>
                    {selectedProduct.stock} in Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Sold Out
                  </span>
                )}

                <button
                  onClick={() => toggleHomeVisibility(selectedProduct._id, selectedProduct.homeVisibility)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    selectedProduct.homeVisibility
                      ? 'bg-purple-100 hover:bg-purple-200 text-purple-800'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  <Home size={14} />
                  {selectedProduct.homeVisibility ? 'Visible on Home' : 'Hidden from Home'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {selectedProduct.category && (
                  <div>
                    <h3 className="text-sm text-gray-500">Category</h3>
                    <p className="text-black">{selectedProduct.category.name}</p>
                  </div>
                )}

                {selectedProduct.subCategory && (
                  <div>
                    <h3 className="text-sm text-gray-500">Sub-Category</h3>
                    <p className="text-black">{selectedProduct.subCategory.name}</p>
                  </div>
                )}

                {selectedProduct.color && (
                  <div>
                    <h3 className="text-sm text-gray-500">Color</h3>
                    <p className="text-black">{selectedProduct.color}</p>
                  </div>
                )}

                {selectedProduct.fabric && (
                  <div>
                    <h3 className="text-sm text-gray-500">Fabric</h3>
                    <p className="text-black">{selectedProduct.fabric}</p>
                  </div>
                )}

                {selectedProduct.size && selectedProduct.size.length > 0 && (
                  <div>
                    <h3 className="text-sm text-gray-500">Available Sizes</h3>
                    <div className="flex gap-2 mt-1">
                      {selectedProduct.size.map((size) => (
                        <span key={size} className="inline-block px-2 py-1 border border-gray-300 rounded text-black">
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedProduct.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2 text-black">Description</h3>
                  <p className="text-gray-600">{selectedProduct.description}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleAddToCartClick(selectedProduct)}
                  className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center text-white ${
                    selectedProduct.stock <= 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-primary-600 hover:bg-primary-700"
                  }`}
                  disabled={selectedProduct.stock <= 0}
                >
                  <ShoppingCart size={18} className="mr-2" />
                  {selectedProduct.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                </button>
                <button
                  onClick={() => {
                    setEditingProduct(selectedProduct)
                    setSelectedProduct(null)
                  }}
                  className="bg-yellow-50 hover:bg-yellow-100 text-yellow-600 py-2 px-4 rounded-md flex items-center justify-center"
                >
                  <Edit size={18} className="mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    deleteP(selectedProduct._id)
                    setSelectedProduct(null)
                  }}
                  className="bg-red-50 hover:bg-red-100 text-red-600 py-2 px-4 rounded-md flex items-center justify-center"
                >
                  <Trash2 size={18} className="mr-2" />
                  Delete
                </button>
                <button
                  onClick={() => {
                    handlePrintProduct(selectedProduct)
                    setSelectedProduct(null)
                  }}
                  className="bg-green-50 hover:bg-green-100 text-green-600 py-2 px-4 rounded-md flex items-center justify-center"
                >
                  <Printer size={18} className="mr-2" />
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">Edit Product</h2>
                <button onClick={() => setEditingProduct(null)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      value={editFormData.price}
                      onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MRP</label>
                    <input
                      type="number"
                      value={editFormData.mrp}
                      onChange={(e) => setEditFormData({...editFormData, mrp: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <input
                      type="number"
                      value={editFormData.stock}
                      onChange={(e) => setEditFormData({...editFormData, stock: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <input
                      type="text"
                      value={editFormData.color}
                      onChange={(e) => setEditFormData({...editFormData, color: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fabric</label>
                    <input
                      type="text"
                      value={editFormData.fabric}
                      onChange={(e) => setEditFormData({...editFormData, fabric: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sizes (comma separated)</label>
                    <input
                      type="text"
                      value={editFormData.size.join(",")}
                      onChange={(e) => setEditFormData({...editFormData, size: e.target.value.split(",").map(s => s.trim())})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                    />
                  </div>

                  <div className="col-span-2 flex items-center">
                    <input
                      type="checkbox"
                      id="homeVisibility"
                      checked={editFormData.homeVisibility}
                      onChange={(e) => setEditFormData({...editFormData, homeVisibility: e.target.checked})}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="homeVisibility" className="ml-2 block text-sm text-gray-700">
                      Show on Home Page
                    </label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductList