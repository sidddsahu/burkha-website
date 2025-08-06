const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

// Add a product to the cart with specified quantity
const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity = 1 } = req.body;

        if (!productId) {
            console.log("Product ID missing in request");
            return res.status(400).json({ message: "Product ID is required" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            console.log("Product not found for ID:", productId);
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.stock < quantity) {
            console.log("Insufficient stock for product:", productId, "Requested:", quantity, "Available:", product.stock);
            return res.status(400).json({ message: `Only ${product.stock} items available in stock` });
        }

        let cart = await Cart.findOne();
        if (!cart) {
            cart = new Cart({ products: [{ product: productId, quantity }] });
            console.log("Created new cart for product:", productId);
        } else {
            const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
            if (productIndex > -1) {
                const newQuantity = cart.products[productIndex].quantity + quantity;
                if (product.stock < newQuantity) {
                    console.log("Insufficient stock for product:", productId, "Requested:", newQuantity, "Available:", product.stock);
                    return res.status(400).json({ message: `Only ${product.stock} items available in stock` });
                }
                cart.products[productIndex].quantity = newQuantity;
                console.log("Updated cart item quantity for product:", productId, "New quantity:", newQuantity);
            } else {
                cart.products.push({ product: productId, quantity });
                console.log("Added product to cart:", productId, "Quantity:", quantity);
            }
        }

        await cart.save();
        const updatedCart = await Cart.findOne().populate('products.product');
        console.log("Cart updated:", updatedCart);
        res.status(200).json(updatedCart);
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ message: error.message });
    }
};

// Add a product to the cart by barcode
const addToCartByBarcode = async (req, res) => {
    try {
        const { barcode, quantity = 1 } = req.body;

        if (!barcode) {
            console.log("Barcode missing in request");
            return res.status(400).json({ message: "Barcode is required" });
        }

        console.log("Fetching product for barcodeNumber:", barcode);
        const product = await Product.findOne({ barcodeNumber: barcode });
        if (!product) {
            console.log("Product not found for barcodeNumber:", barcode);
            return res.status(404).json({ message: "Product not found for this barcode" });
        }

        if (product.stock < quantity) {
            console.log("Insufficient stock for product:", product._id, "Requested:", quantity, "Available:", product.stock);
            return res.status(400).json({ message: `Only ${product.stock} items available in stock` });
        }

        let cart = await Cart.findOne();
        if (!cart) {
            cart = new Cart({ products: [{ product: product._id, quantity }] });
            console.log("Created new cart for product:", product._id);
        } else {
            const productIndex = cart.products.findIndex(p => p.product.toString() === product._id.toString());
            if (productIndex > -1) {
                const newQuantity = cart.products[productIndex].quantity + quantity;
                if (product.stock < newQuantity) {
                    console.log("Insufficient stock for product:", product._id, "Requested:", newQuantity, "Available:", product.stock);
                    return res.status(400).json({ message: `Only ${product.stock} items available in stock` });
                }
                cart.products[productIndex].quantity = newQuantity;
                console.log("Updated cart item quantity for product:", product._id, "New quantity:", newQuantity);
            } else {
                cart.products.push({ product: product._id, quantity });
                console.log("Added product to cart:", product._id, "Quantity:", quantity);
            }
        }

        await cart.save();
        const updatedCart = await Cart.findOne().populate('products.product');
        console.log("Cart updated:", updatedCart);
        res.status(200).json(updatedCart);
    } catch (error) {
        console.error("Error adding to cart by barcode:", error);
        res.status(500).json({ message: error.message });
    }
};

// Update product quantity in cart, delete if quantity is 0
const updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        if (!productId || quantity === undefined) {
            console.log("Product ID or quantity missing in request");
            return res.status(400).json({ message: "Product ID and quantity are required" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            console.log("Product not found for ID:", productId);
            return res.status(404).json({ message: "Product not found" });
        }

        if (quantity > product.stock) {
            console.log("Insufficient stock for product:", productId, "Requested:", quantity, "Available:", product.stock);
            return res.status(400).json({ message: `Only ${product.stock} items available in stock` });
        }

        let cart = await Cart.findOne();
        if (!cart) {
            console.log("Cart not found");
            return res.status(404).json({ message: "Cart not found" });
        }

        const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
        if (productIndex === -1) {
            console.log("Product not found in cart:", productId);
            return res.status(404).json({ message: "Product not found in cart" });
        }

        if (quantity <= 0) {
            cart.products.splice(productIndex, 1);
            console.log("Removed product from cart:", productId);
        } else {
            cart.products[productIndex].quantity = quantity;
            console.log("Updated cart item quantity for product:", productId, "New quantity:", quantity);
        }

        await cart.save();
        const updatedCart = await Cart.findOne().populate('products.product');
        console.log("Cart updated:", updatedCart);
        res.status(200).json(updatedCart);
    } catch (error) {
        console.error("Error updating cart item:", error);
        res.status(500).json({ message: error.message });
    }
};

const removeCartItem = async (req, res) => {
    try {
        console.log("Removing product from cart:", req.params);
        const { productId } = req.params;

        // Find the cart and populate product details
        let cart = await Cart.findOne()
        
        console.log("Cart:", cart);

        if (!cart) {
            console.log("Cart not found");
            return res.status(404).json({ message: "Cart not found" });
        }
        const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
        console.log("Product index:", productIndex);
        // Check if cart.products is null or undefined, and initialize it as an empty array if so
        if (!cart.products || cart.products.length === 0) {
            console.log("No products in cart");
            return res.status(200).json(cart);
        }

        // Check if the product exists in the cart
        const initialProductCount = cart.products.length;
        cart.products = cart.products.filter(p => p._id.toString() !== productId);
        console.log("Cart after removing product:", cart.products);
        
        if (initialProductCount === cart.products.length) {
            console.log("Product not found in cart:", productId);
            return res.status(404).json({ message: "Product not found in cart" });
        }

        console.log("Removed product from cart:", productId);
        await cart.save();

        // Fetch the updated cart with populated products
        const updatedCart = await Cart.findOne().populate('products.product');
        console.log("Cart updated:", updatedCart);
        res.status(200).json(updatedCart);
    } catch (error) {
        console.error("Error removing cart item:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get the cart details
const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne().populate('products.product');
        if (!cart) {
            console.log("Cart not found");
            return res.status(404).json({ message: "Cart is empty" });
        }

        console.log("Fetched cart:", cart);
        res.status(200).json(cart);
    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addToCart, addToCartByBarcode, updateCartItem, removeCartItem, getCart };