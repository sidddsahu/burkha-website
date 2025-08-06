"use client"

import { useState, useEffect } from "react"
import { addProduct, fetchcategory, fetchSubcategory } from "../api"
import { CheckCircle, Upload, X } from "lucide-react"
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const CreateProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    color: "",
    fabric: "",
    size: [],
    category: "",
    subCategory: "",
    images: [],
    stock: "" // Added stock field
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [error, setError] = useState("")

  // Fetch categories and subcategories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      try {
        const response = await fetchcategory();
        if (response.data) {
          setCategories(response.data)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
        setError("Failed to load categories. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  // Fetch all subcategories once
  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const response = await fetchSubcategory();
        if (response.data) {
          setSubCategories(response.data)
        }
      } catch (error) {
        console.error("Error fetching subcategories:", error)
      }
    }
    fetchSubCategories()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDescriptionChange = (event, editor) => {
    const data = editor.getData()
    setFormData((prev) => ({
      ...prev,
      description: data,
    }))
  }

  const handleSizeToggle = (size) => {
    setFormData((prev) => {
      const sizes = [...prev.size]
      if (sizes.includes(size)) {
        return { ...prev, size: sizes.filter((s) => s !== size) }
      } else {
        return { ...prev, size: [...sizes, size] }
      }
    })
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    
    if (files.length + imageFiles.length > 5) {
      setError("You can upload a maximum of 5 images")
      return
    }

    // Add new files to existing files
    setImageFiles((prev) => [...prev, ...files.slice(0, 5 - prev.length)])
    setError("")

    // Create previews for new files
    const newPreviews = []
    files.slice(0, 5 - imageFiles.length).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        newPreviews.push(e.target.result)
        if (newPreviews.length === files.length || newPreviews.length === (5 - imageFiles.length)) {
          setImagePreviews((prev) => [...prev, ...newPreviews])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create FormData object for file uploads
      const productData = new FormData()

      // Add all form fields except images
      Object.keys(formData).forEach((key) => {
        if (key === "size") {
          productData.append(key, JSON.stringify(formData[key]))
        } else if (key !== "images") {
          productData.append(key, formData[key])
        }
      })

      // Add image files
      imageFiles.forEach((file) => {
        productData.append("images", file)
      })

      await addProduct(productData)
      setSuccess(true)

      // Reset form
      setFormData({
        name: "",
        price: "",
        description: "",
        color: "",
        fabric: "",
        size: [],
        category: "",
        subCategory: "",
        images: [],
        stock: "" // Reset stock
      })
      setImageFiles([])
      setImagePreviews([])

      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error("Error adding product:", error)
      setError("Failed to add product. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Filter subcategories based on selected category
  const filteredSubCategories = formData.category 
    ? subCategories.filter(subCat => subCat.category === formData.category)
    : [];

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-primary-600 text-white">
        <h2 className="text-xl font-bold">Add New Product</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="flex items-center justify-center text-red-600 bg-red-50 p-3 rounded-md">
            <X className="mr-2" size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


            <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category*
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-Category */}
          <div>
            <label htmlFor="subCategory" className="block text-sm font-medium text-gray-700 mb-1">
              Sub-Category
            </label>
            <select
              id="subCategory"
              name="subCategory"
              value={formData.subCategory}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={!formData.category}
            >
              <option value="">Select Sub-Category</option>
              {filteredSubCategories.map((subCategory) => (
                <option key={subCategory._id} value={subCategory._id}>
                  {subCategory.name}
                </option>
              ))}
            </select>
          </div>
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Product Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter product name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹)*
            </label>
            <input
              type="number"
              id="price"
              name="price"
              placeholder="0.00"
              value={formData.price}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Stock/Available Quantity */}
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
              Available Quantity*
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              placeholder="0"
              value={formData.stock}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Category */}
        

          {/* Color */}
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <input
              type="text"
              id="color"
              name="color"
              placeholder="e.g., Red, Blue, Black"
              value={formData.color}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Fabric */}
          <div>
            <label htmlFor="fabric" className="block text-sm font-medium text-gray-700 mb-1">
              Fabric
            </label>
            <input
              type="text"
              id="fabric"
              name="fabric"
              placeholder="e.g., Cotton, Polyester"
              value={formData.fabric}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Size Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
          <div className="flex flex-wrap gap-3">
            {["52", "54", "56", "58"].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleSizeToggle(size)}
                className={`px-4 py-2 rounded-md border ${
                  formData.size.includes(size)
                    ? "bg-primary-600 text-white border-primary-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Description with CKEditor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <div className="border border-gray-300 rounded-md">
            <CKEditor
              editor={ClassicEditor}
              data={formData.description}
              onChange={handleDescriptionChange}
              config={{
                toolbar: [
                  'heading', '|', 
                  'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|',
                  'blockQuote', 'insertTable', 'undo', 'redo'
                ]
              }}
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="h-24 w-24 object-cover rounded-md border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <label className={`flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-primary-500 focus:outline-none ${imageFiles.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div className="flex flex-col items-center space-y-2">
              <Upload className="w-6 h-6 text-gray-500" />
              <span className="font-medium text-gray-600">
                Drop files to upload or
                <span className="text-primary-600 underline ml-1">browse</span>
              </span>
              <span className="text-xs text-gray-500">
                {imageFiles.length >= 5 
                  ? 'Maximum 5 images reached' 
                  : `Upload up to 5 images (${imageFiles.length}/5)`
                }
              </span>
            </div>
            <input
              type="file"
              name="images"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
              disabled={imageFiles.length >= 5}
            />
          </label>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Adding Product..." : "Add Product"}
          </button>
        </div>

        {success && (
          <div className="flex items-center justify-center text-green-600 bg-green-50 p-3 rounded-md">
            <CheckCircle className="mr-2" size={18} />
            <span>Product added successfully!</span>
          </div>
        )}
      </form>
    </div>
  )
}

export default CreateProduct