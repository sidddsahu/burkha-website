import { useRef, useState, useEffect } from "react";
import { QrCode, Camera, AlertCircle, CheckCircle, Loader2, X, Scan, ShoppingCart, Keyboard } from "lucide-react";
import axios from "axios";

const PurchaseScanQRCode = () => {
  const videoRef = useRef(null);
  const [product, setProduct] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [cartQuantity, setCartQuantity] = useState("1");
  const [cartQuantityError, setCartQuantityError] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [scanTimeout, setScanTimeout] = useState(false);

  // Get product by barcode
  const getProductByBarcode = async (barcode) => {
    try {
      console.log("Fetching product for barcodeNumber:", barcode);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/purchase/barcode/${barcode}`);
      console.log("Product response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw new Error(error.response?.data?.message || "Product not found for this barcode");
    }
  };

  // Update purchase and product stock
  const updateProductQuantity = async (barcode, quantity) => {
    try {
      console.log("Updating purchase for barcodeNumber:", barcode, "Quantity:", quantity);
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/purchase/scan`, {
        barcode,
        quantity
      });
      console.log("Purchase update response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating purchase:", error);
      throw new Error(error.response?.data?.message || "Failed to record purchase");
    }
  };

  // Add product to cart by barcode
  const addToCart = async (barcode, quantity) => {
    setCartLoading(true);
    try {
      console.log("Sending request to add to cart - BarcodeNumber:", barcode, "Quantity:", quantity);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/cart/addByBarcode`, {
        barcode,
        quantity
      });
      console.log("Cart response:", response.data);
      setShowAddToCartModal(false);
      setScannedProduct(null);
      setCartQuantity("1");
      setCartQuantityError(null);
      setBarcode("");
      setProduct(null);
      setPurchaseSuccess(true);
      setError("Product added to cart successfully!");
      alert("Product added to cart successfully!");
      return response.data;
    } catch (error) {
      console.error("Error adding to cart:", error);
      const errorMessage = error.response?.data?.message || "Failed to add product to cart";
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
      throw new Error(errorMessage);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    if (!scanning) return;

    // Check for BarcodeDetector support
    if (!("BarcodeDetector" in window)) {
      setError("Barcode Detection API is not supported in this browser. Please use a modern browser like Chrome or Edge.");
      alert("Barcode Detection API is not supported in this browser.");
      console.error("BarcodeDetector not supported");
      setScanning(false);
      return;
    }

    // Initialize BarcodeDetector with expanded formats
    const barcodeDetector = new window.BarcodeDetector({
      formats: ["qr_code", "ean_13", "code_128", "upc_a", "upc_e", "code_39", "itf"]
    });

    let stream;
    let timeoutId;

    const startCamera = async () => {
      try {
        console.log("Starting camera...");
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: 640, height: 480 }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            console.log("Camera started, detecting barcodes...");
            detectBarcode();
          };
        }

        // Set scan timeout
        timeoutId = setTimeout(() => {
          console.log("Scan timeout after 30 seconds");
          setScanning(false);
          setScanTimeout(true);
          setError("Scanning timed out. Please try again.");
          alert("Scanning timed out. Please try again.");
        }, 30000);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Unable to access the camera. Please check permissions or use a secure server (HTTPS).");
        alert("Unable to access the camera. Please check permissions or use HTTPS.");
        setScanning(false);
      }
    };

    const detectBarcode = async () => {
      if (!videoRef.current || !scanning) return;

      try {
        const barcodes = await barcodeDetector.detect(videoRef.current);
        if (barcodes.length > 0) {
          const scannedBarcode = barcodes[0].rawValue.trim();
          console.log("Detected barcodeNumber:", scannedBarcode);
          setBarcode(scannedBarcode);
          handleScannedProduct(scannedBarcode);
        } else if (scanning) {
          requestAnimationFrame(detectBarcode);
        }
      } catch (err) {
        console.error("Error detecting barcode:", err);
        setError("Failed to detect barcode. Please try again.");
        alert("Failed to detect barcode. Please try again.");
        setScanning(false);
      }
    };

    const handleScannedProduct = async (scannedBarcode) => {
      setLoading(true);
      console.log("Handling scanned barcodeNumber:", scannedBarcode);
      try {
        const productData = await getProductByBarcode(scannedBarcode);
        console.log("Product fetched successfully:", productData);
        setScannedProduct(productData);
        setShowAddToCartModal(true);
        setScanning(false);
        alert(`Product found: ${productData.name}`);
      } catch (err) {
        console.error("Error handling scanned product:", err.message);
        setError(err.message);
        alert(`Error: ${err.message}`);
        setScanning(false);
      } finally {
        setLoading(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        console.log("Camera stream stopped");
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [scanning]);

  const startScanning = () => {
    console.log("Starting scanning...");
    setError(null);
    setProduct(null);
    setBarcode("");
    setPurchaseSuccess(false);
    setScannedProduct(null);
    setShowAddToCartModal(false);
    setCartQuantity("1");
    setCartQuantityError(null);
    setManualBarcode("");
    setScanTimeout(false);
    setScanning(true);
  };

  const stopScanning = () => {
    console.log("Stopping scanning...");
    setScanning(false);
  };

  const handlePurchase = async () => {
    if (!product || !barcode) {
      console.log("No product or barcode for purchase");
      setError("No product or barcode selected for purchase");
      alert("No product or barcode selected for purchase");
      return;
    }

    setPurchaseLoading(true);
    try {
      await updateProductQuantity(barcode, quantity);
      console.log("Purchase recorded successfully");
      setPurchaseSuccess(true);
      setProduct(null);
      setBarcode("");
      setQuantity(1);
      alert("Purchase recorded successfully!");
    } catch (err) {
      console.error("Error recording purchase:", err.message);
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleQuantityChange = (value) => {
    console.log("Quantity changed:", value);
    setCartQuantity(value);
    const numValue = parseInt(value, 10);
    if (!value) {
      setCartQuantityError("Quantity is required");
    } else if (isNaN(numValue) || numValue < 1) {
      setCartQuantityError("Quantity must be at least 1");
    } else if (scannedProduct && numValue > scannedProduct.stock) {
      setCartQuantityError(`Quantity cannot exceed available stock (${scannedProduct.stock})`);
    } else {
      setCartQuantityError(null);
    }
  };

  const handleManualBarcodeSubmit = async () => {
    if (!manualBarcode) {
      console.log("Manual barcode input is empty");
      setError("Please enter a barcode");
      alert("Please enter a barcode");
      return;
    }

    const trimmedBarcode = manualBarcode.trim();
    if (trimmedBarcode.length > 50) {
      console.log("Manual barcode too long:", trimmedBarcode);
      setError("Barcode is too long (max 50 characters)");
      alert("Barcode is too long (max 50 characters)");
      return;
    }

    console.log("Submitting manual barcodeNumber:", trimmedBarcode);
    setBarcode(trimmedBarcode);
    setLoading(true);

    try {
      const productData = await getProductByBarcode(trimmedBarcode);
      console.log("Manual barcode product fetched:", productData);
      setScannedProduct(productData);
      setShowAddToCartModal(true);
      setManualBarcode("");
      alert(`Product found: ${productData.name}`);
    } catch (err) {
      console.error("Error fetching product for manual barcode:", err.message);
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <QrCode className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Purchase Scanner</h1>
            </div>
            {scanning && (
              <button
                onClick={stopScanning}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Status Messages */}
        <div className="px-6 pt-4">
          {error && (
            <div className="flex items-center bg-red-50 text-red-700 p-3 rounded-lg mb-4 border border-red-200">
              <AlertCircle className="mr-2 flex-shrink-0" />
              {/* <span>{error}</span> */}
            </div>
          )}

          {purchaseSuccess && (
            <div className="flex items-center bg-green-50 text-green-700 p-3 rounded-lg mb-4 border border-green-200">
              <CheckCircle className="mr-2 flex-shrink-0" />
              <span>{error || "Action completed successfully!"}</span>
            </div>
          )}

          {scanTimeout && (
            <div className="flex items-center bg-yellow-50 text-yellow-700 p-3 rounded-lg mb-4 border border-yellow-200">
              <AlertCircle className="mr-2 flex-shrink-0" />
              <span>Scanning timed out. Try adjusting lighting or repositioning the barcode.</span>
            </div>
          )}
        </div>

        {/* Scanner Area */}
        <div className="px-6 pb-6">
          {scanning ? (
            <div className="relative">
              <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-blue-400">
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline
                  muted
                />
                {/* Scanner overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-64 h-64 border-4 border-blue-400 rounded-lg">
                    <div className="absolute -top-1 left-0 right-0 h-1 bg-blue-400 animate-pulse"></div>
                    <div className="absolute -left-1 top-0 bottom-0 w-1 bg-blue-400 animate-pulse"></div>
                    <div className="absolute -right-1 top-0 bottom-0 w-1 bg-blue-400 animate-pulse"></div>
                    <div className="absolute -bottom-1 left-0 right-0 h-1 bg-blue-400 animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center text-sm text-gray-500">
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing barcode...</span>
                  </div>
                ) : (
                  <span>Point your camera at a barcode</span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 space-y-4">
              <div className="relative mb-6">
                <div className="w-40 h-40 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center border-2 border-dashed border-blue-200">
                  <QrCode className="h-20 w-20 text-blue-400" />
                </div>
                <div className="absolute -bottom-3 -right-3 bg-blue-500 rounded-full p-3 shadow-lg">
                  <Scan className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* Manual Barcode Input */}
              <div className="w-full max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter Barcode Manually
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleManualBarcodeSubmit()}
                    placeholder="Enter barcode"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={handleManualBarcodeSubmit}
                    disabled={loading || !manualBarcode.trim()}
                    className={`p-2 rounded-md flex items-center justify-center ${
                      loading || !manualBarcode.trim() ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                  >
                    <Keyboard className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">Supported formats: QR Code, EAN-13, Code 128, UPC-A, UPC-E, Code 39, ITF</p>
              </div>

              <button
                onClick={startScanning}
                className="w-full max-w-xs py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition flex items-center justify-center space-x-2"
              >
                <Camera className="h-5 w-5" />
                <span>Start Scanning</span>
              </button>
            </div>
          )}

          {/* Add to Cart Modal */}
          {showAddToCartModal && scannedProduct && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold">Add to Cart</h2>
                  <button
                    onClick={() => {
                      console.log("Closing modal");
                      setShowAddToCartModal(false);
                      setScannedProduct(null);
                      setCartQuantity("1");
                      setCartQuantityError(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="mb-4 space-y-2">
                  <p className="text-lg font-medium">{scannedProduct.name}</p>
                  <p className="text-sm text-gray-600">Price: ₹{scannedProduct.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Available: {scannedProduct.stock} in stock</p>
                  <p className="text-sm text-gray-600">Barcode Number: {barcode}</p>
                  {scannedProduct.barcode && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Barcode Image:</p>
                      <img 
                        src={scannedProduct.barcode} 
                        alt="Barcode" 
                        className="w-32 h-auto mt-1 border border-gray-200 rounded" 
                        onError={() => console.log("Failed to load barcode image:", scannedProduct.barcode)}
                      />
                    </div>
                  )}
                  {scannedProduct.description && (
                    <p className="text-sm text-gray-600">Description: {scannedProduct.description}</p>
                  )}
                  {scannedProduct.category && (
                    <p className="text-sm text-gray-600">Category: {scannedProduct.category?.name || 'N/A'}</p>
                  )}
                  {scannedProduct.size && scannedProduct.size.length > 0 && (
                    <p className="text-sm text-gray-600">Sizes: {scannedProduct.size.join(', ')}</p>
                  )}
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="text"
                    value={cartQuantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md ${
                      cartQuantityError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter quantity"
                  />
                  {cartQuantityError && (
                    <p className="text-red-500 text-sm mt-1">{cartQuantityError}</p>
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      console.log("Cancel button clicked");
                      setShowAddToCartModal(false);
                      setScannedProduct(null);
                      setCartQuantity("1");
                      setCartQuantityError(null);
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      console.log("Add to cart button clicked, quantity:", cartQuantity);
                      const numQuantity = parseInt(cartQuantity, 10);
                      if (!cartQuantityError && numQuantity >= 1 && numQuantity <= scannedProduct.stock) {
                        addToCart(barcode, numQuantity);
                      } else {
                        console.log("Invalid quantity, cannot add to cart");
                        alert("Please enter a valid quantity");
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
                    disabled={cartLoading || cartQuantityError || !cartQuantity}
                  >
                    {cartLoading ? (
                      <Loader2 size={18} className="mr-2 animate-spin" />
                    ) : (
                      <ShoppingCart size={18} className="mr-2" />
                    )}
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Scanned Product for Purchase */}
          {product && (
            <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-bold text-gray-800">₹{product.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Quantity to Add:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    onClick={handlePurchase}
                    disabled={purchaseLoading}
                    className={`w-full py-3 rounded-lg font-medium text-white transition flex items-center justify-center space-x-2 ${
                      purchaseLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 shadow-md'
                    }`}
                  >
                    {purchaseLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                    <span>{purchaseLoading ? 'Processing...' : 'Record Purchase'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Scanned Barcode Info */}
          {barcode && !product && !scanning && !showAddToCartModal && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 text-center text-sm">
              <span className="font-medium">Scanned Barcode Number:</span> {barcode}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseScanQRCode;