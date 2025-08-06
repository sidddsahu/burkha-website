import React from "react";

const PriceLabel = () => {
  return (
    <div
      style={{
        width: "280px",
        border: "2px solid black",
        padding: "10px",
        fontFamily: "Arial, sans-serif",
        fontSize: "13px",
        color: "#000",
        backgroundColor: "#fff",
      }}
    >
      {/* MRP */}
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "18px" }}>
        <span>MRP ₹</span>
        <span>1000</span>
      </div>
      <div style={{ fontSize: "10px", marginTop: "2px" }}>Inclusive of All Taxes</div>

      {/* Line */}
      <div style={{ borderBottom: "2px solid black", margin: "8px 0" }}></div>

      {/* Item Info */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span>
          <strong>Item No.</strong> : 123456
        </span>
        <span>
          <strong>Item</strong> : KURTI
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span>
          <strong>Size</strong> : L
        </span>
        <span>
          <strong>Color</strong> : White
        </span>
      </div>

      {/* Barcode Image */}
      <div style={{ textAlign: "center", margin: "10px 0 5px" }}>
        <img
          src="https://barcode.tec-it.com/barcode.ashx?data=10006&code=Code128&translate-esc=false"
          alt="Barcode"
          style={{ height: "50px" }}
        />
      </div>

      {/* Barcode Number */}
      <div style={{ textAlign: "center", letterSpacing: "4px", fontSize: "14px", marginBottom: "6px" }}>
        10006
      </div>

      {/* Brand Name */}
      <div style={{ textAlign: "center", fontSize: "20px", fontWeight: "bold", marginBottom: "5px" }}>
        B. YOU
      </div>

      {/* Company Info */}
      <div style={{ fontSize: "11px", textAlign: "center", lineHeight: "1.5" }}>
        Mfg. & Mkt By <strong>PATTERNS</strong>
        <br />
        DADAR (E). MUMBAI-400014
        <br />
        CUSTOMER CARE : 0222414133
      </div>
    </div>
  );
};

export default PriceLabel;