const asyncHandler = require("express-async-handler");
const Product = require("../models/product.model");
const Purchase = require("../models/Purchase2.Model");


const getProductByBarcode = asyncHandler(async (req, res) => {
  const { barcode } = req.params;

  if (!barcode) {
    console.log("Barcode missing in request");
    res.status(400);
    throw new Error("Barcode is required");
  }

  console.log("Fetching product for barcodeNumber:", barcode);
  const product = await Product.findOne({ barcodeNumber: barcode });

  if (!product) {
    console.log("Product not found for barcodeNumber:", barcode);
    res.status(404);
    throw new Error("Product not found");
  }

  console.log("Product found:", product);
  res.json(product);
});


const scanAndIncreaseQuantity = asyncHandler(async (req, res) => {
  const { barcode, quantity = 1 } = req.body;

  if (!barcode) {
    console.log("Barcode missing in request");
    res.status(400);
    throw new Error("Barcode is required");
  }

  console.log("Scanning barcodeNumber:", barcode, "quantity:", quantity);
  const product = await Product.findOne({ barcodeNumber: barcode });

  if (!product) {
    console.log("Product not found for barcodeNumber:", barcode);
    res.status(404);
    throw new Error("Product not found");
  }

  // Update product stock
  product.stock = (parseInt(product.stock) || 0) + stock;
  await product.save();
  console.log("Updated product stock:", product.stock);

  // Check if a purchase record exists for today and the same product
  let purchase = await Purchase.findOne({
    "products.product": product._id,
    purchaseDate: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      $lt: new Date(new Date().setHours(23, 59, 59, 999))
    }
  });

  if (purchase) {
    const productEntry = purchase.products.find(
      (p) => p.product.toString() === product._id.toString()
    );
    if (productEntry) {
      productEntry.quantity += quantity;
    } else {
      purchase.products.push({ product: product._id, quantity });
    }
    console.log("Updated purchase for today");
  } else {
    // Create new purchase
    purchase = new Purchase({
      products: [{ product: product._id, quantity }]
    });
    console.log("Created new purchase entry");
  }

  await purchase.save();

  res.json({
    message: `Quantity increased by ${quantity}`,
    updatedProductStock: product.stock,
    updatedPurchaseQuantity: purchase.products.find(
      (p) => p.product.toString() === product._id.toString()
    ).quantity,
    productId: product._id,
    purchaseId: purchase._id,
  });
});


module.exports = {
  getProductByBarcode,
  scanAndIncreaseQuantity,
};