import React, { useEffect } from 'react';
import Quagga from 'quagga';

const BarcodeScanner = ({ onDetected, onCancel }) => {
  useEffect(() => {
    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: document.querySelector('#scanner-container'),
        constraints: {
          width: 480,
          height: 320,
          facingMode: "environment"
        },
      },
      decoder: {
        readers: ["ean_reader", "ean_8_reader", "code_128_reader", "code_39_reader"]
      },
    }, (err) => {
      if (err) {
        console.error("Failed to initialize Quagga:", err);
        return;
      }
      Quagga.start();
    });

    Quagga.onDetected((result) => {
      const code = result.codeResult.code;
      onDetected(code);
    });

    return () => {
      Quagga.offDetected();
      Quagga.stop();
    };
  }, [onDetected]);

  return (
    <div className="text-center">
      <div id="scanner-container" className="mb-4" style={{ width: '100%', height: '300px' }} />
      <button
        onClick={onCancel}
        className="px-4 py-2 bg-red-600 text-white rounded-md"
      >
        Cancel Scanning
      </button>
    </div>
  );
};

export default BarcodeScanner;