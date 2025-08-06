import { useRef, useState, useEffect } from "react";
import { QrCode, Camera, AlertCircle, CheckCircle, Loader2, X, Scan, Keyboard } from "lucide-react";
import axios from "axios";

const PurchaseScanQRCode = () => {
  const videoRef = useRef(null);
  const [product, setProduct] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [stockUpdateSuccess, setStockUpdateSuccess] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [quantityError, setQuantityError] = useState(null);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
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

  // Increase product stock
  const increaseStock = async (barcode, quantity) => {
    setLoading(true);
    try {
      console.log("Increasing stock for barcodeNumber:", barcode, "Quantity:", quantity);
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/purchase/scanStock`, {
        barcode,
        quantity
      });
      console.log("Stock update response:", response.data);
      setShowQuantityModal(false);
      setScannedProduct(null);
      setQuantity("1");
      setQuantityError(null);
      setBarcode("");
      setProduct(null);
      setStockUpdateSuccess(true);
      setError("Stock updated successfully!");
      alert("Stock updated successfully!");
      return response.data;
    } catch (error) {
      console.error("Error increasing stock:", error);
      const errorMessage = error.response?.data?.message || "Failed to update stock";
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
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
        setShowQuantityModal(true);
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
    setStockUpdateSuccess(false);
    setScannedProduct(null);
    setShowQuantityModal(false);
    setQuantity("1");
    setQuantityError(null);
    setManualBarcode("");
    setScanTimeout(false);
    setScanning(true);
  };

  const stopScanning = () => {
    console.log("Stopping scanning...");
    setScanning(false);
  };

  const handleQuantityChange = (value) => {
    console.log("Quantity changed:", value);
    setQuantity(value);
    const numValue = parseInt(value, 10);
    if (!value) {
      setQuantityError("Quantity is required");
    } else if (isNaN(numValue) || numValue < 1) {
      setQuantityError("Quantity must be at least 1");
    } else {
      setQuantityError(null);
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
      setShowQuantityModal(true);
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
              <h1 className="text-2xl font-bold">Stock Update Scanner</h1>
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

          {stockUpdateSuccess && (
            <div className="flex items-center bg-green-50 text-green-700 p-3 rounded-lg mb-4 border border-green-200">
              <CheckCircle className="mr-2 flex-shrink-0" />
              <span>{error || "Stock updated successfully!"}</span>
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

          {/* Quantity Modal */}
          {showQuantityModal && scannedProduct && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold">Update Stock</h2>
                  <button
                    onClick={() => {
                      console.log("Closing modal");
                      setShowQuantityModal(false);
                      setScannedProduct(null);
                      setQuantity("1");
                      setQuantityError(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="mb-4 space-y-2">
                  <p className="text-lg font-medium">{scannedProduct.name}</p>
                  <p className="text-sm text-gray-600">Current Stock: {scannedProduct.stock}</p>
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
                    Quantity to Add
                  </label>
                  <input
                    type="text"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md ${
                      quantityError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter quantity"
                  />
                  {quantityError && (
                    <p className="text-red-500 text-sm mt-1">{quantityError}</p>
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      console.log("Cancel button clicked");
                      setShowQuantityModal(false);
                      setScannedProduct(null);
                      setQuantity("1");
                      setQuantityError(null);
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      console.log("Update stock button clicked, quantity:", quantity);
                      const numQuantity = parseInt(quantity, 10);
                      if (!quantityError && numQuantity >= 1) {
                        increaseStock(barcode, numQuantity);
                      } else {
                        console.log("Invalid quantity, cannot update stock");
                        alert("Please enter a valid quantity");
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
                    disabled={loading || quantityError || !quantity}
                  >
                    {loading ? (
                      <Loader2 size={18} className="mr-2 animate-spin" />
                    ) : (
                      <CheckCircle size={18} className="mr-2" />
                    )}
                    Update Stock
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseScanQRCode;