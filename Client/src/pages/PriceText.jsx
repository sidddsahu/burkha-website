import React from "react";

const PriceTag = () => {
  return (
    <div
      style={{
        width: "300px",
        padding: "20px",
        border: "4px solid black",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#fff",
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: "22px" }}>
        MRP <span style={{ fontSize: "26px" }}>₹ 1000</span>
      </div>
      <div style={{ fontSize: "12px", marginBottom: "10px" }}>
        Inclusive of All Taxes
      </div>

      <hr style={{ border: "1px solid black", marginBottom: "10px" }} />

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "5px" }}>
        <span>Item No. : <strong>123456</strong></span>
        <span>Item : <strong>KURTI</strong></span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "10px" }}>
        <span>Size : <strong>L</strong></span>
        <span>Color : <strong>White</strong></span>
      </div>

      {/* Simulated Barcode */}
      <div style={{ textAlign: "center", marginBottom: "5px" }}>
        <img
          src="https://barcode.tec-it.com/barcode.ashx?data=123456789012&code=EAN13&translate-esc=false"
          alt="Barcode"
          style={{ width: "100%", height: "50px", objectFit: "contain" }}
        />
      </div>

      <div style={{ textAlign: "center", letterSpacing: "4px", marginBottom: "10px" }}>10006</div>

      <div style={{ textAlign: "center", fontSize: "20px", fontWeight: "bold", marginBottom: "5px" }}>
        B. YOU
      </div>

      <div style={{ fontSize: "12px", textAlign: "center", lineHeight: "1.5" }}>
        Mfg. & Mkt By <strong>PATTERNS</strong><br />
        DADAR (E). MUMBAI-400014<br />
        CUSTOMER CARE : 0222414133
      </div>
    </div>
  );
};

export default PriceTag;