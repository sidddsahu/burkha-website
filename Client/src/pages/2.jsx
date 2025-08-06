import { useRef, useState, useEffect } from "react";
import { getProductByBarcode } from "../api";
import { QrCode, Camera, AlertCircle } from "lucide-react";
import { useCart } from "../CartContext";
import jsQR from "jsqr";

const ScanQRCode = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [product, setProduct] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [barcode, setBarcode] = useState(null);
  const { fetchCart } = useCart();

  useEffect(() => {
    if (!scanning) return;

    let stream;
    let animationId;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            detectBarcode();
          };
        }

        const detectBarcode = async () => {
          if (!videoRef.current || !canvasRef.current) return;

          const canvas = canvasRef.current;
          const context = canvas.getContext("2d");

          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;

          context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, canvas.width, canvas.height);

          if (code) {
            const scannedBarcode = code.data;
            setBarcode(scannedBarcode);

            try {
              const response = await getProductByBarcode(scannedBarcode);
              setProduct(response.data);
              setScanning(false);
              fetchCart();
            } catch (err) {
              setError("Product not found. Please try again or add this product.");
              setScanning(false);
            }
          } else if (scanning) {
            animationId = requestAnimationFrame(detectBarcode);
          }
        };
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Unable to access the camera. Please check permissions or run the code on a secure server.");
        setScanning(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      cancelAnimationFrame(animationId);
    };
  }, [scanning, fetchCart]);

  const startScan = () => {
    setError(null);
    setProduct(null);
    setBarcode(null);
    setScanning(true);
  };

  const stopScan = () => {
    setScanning(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-primary-600 text-white">
        <h2 className="text-xl font-bold flex items-center">
          <QrCode className="mr-2" size={48} />
          Scan Product Barcode
        </h2>
      </div>

      <div className="p-6">
        <div className="relative bg-black rounded-lg overflow-hidden mb-4">
          <video ref={videoRef} className="w-full h-64 object-cover" />
          <canvas ref={canvasRef} className="hidden" />

          {!scanning && !product && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white">
              <div className="text-center p-4">
                <Camera size={24} className="mx-auto mb-2" />
                <p>Camera preview will appear here</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
            <AlertCircle size={18} className="mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex space-x-3">
          {!scanning ? (
            <button
              onClick={startScan}
              className="flex-1 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Camera size={18} className="mr-2" />
              Start Scanning
            </button>
          ) : (
            <button
              onClick={stopScan}
              className="flex-1 flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Stop Scanning
            </button>
          )}
        </div>

        {barcode && (
          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <p className="text-sm text-gray-700">
              Scanned Barcode: <span className="font-medium">{barcode}</span>
            </p>
          </div>
        )}

        {product && (
          <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{product.name}</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Price:</span>
              <span className="text-xl font-bold text-primary-600">₹{Number.parseFloat(product.price).toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanQRCode;
