const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate(
            'items.product',
            'name price images stock type unit'
        );

        if (!cart) {
            cart = await Cart.create({ user: req.user._id });
        }

        res.json({
            success: true,
            data: cart,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/cart/items
// @desc    Add item to cart
// @access  Private
router.post('/items', protect, async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        // Validate product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check stock availability
        if (product.stock < quantity) {
            return res.status(400).json({
                message: `Insufficient stock. Available: ${product.stock}`,
            });
        }

        // Find or create cart
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id });
        }

        // Add/update item
        cart.addItem(product, quantity);
        await cart.save();

        // Populate and return
        cart = await Cart.findById(cart._id).populate('items.product', 'name price images stock type unit');

        res.json({
            success: true,
            message: 'Item added to cart',
            data: cart,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/cart/items/:productId
// @desc    Update item quantity in cart
// @access  Private
router.put('/items/:productId', protect, async (req, res) => {
    try {
        const { quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }

        // Validate product and stock
        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.stock < quantity) {
            return res.status(400).json({
                message: `Insufficient stock. Available: ${product.stock}`,
            });
        }

        // Update cart
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.updateQuantity(req.params.productId, quantity);
        await cart.save();

        // Populate and return
        cart = await Cart.findById(cart._id).populate('items.product', 'name price images stock type unit');

        res.json({
            success: true,
            message: 'Cart updated',
            data: cart,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/cart/items/:productId
// @desc    Remove item from cart
// @access  Private
router.delete('/items/:productId', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.removeItem(req.params.productId);
        await cart.save();

        // Populate and return
        cart = await Cart.findById(cart._id).populate('items.product', 'name price images stock type unit');

        res.json({
            success: true,
            message: 'Item removed from cart',
            data: cart,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Private
router.delete('/', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.clearCart();
        await cart.save();

        res.json({
            success: true,
            message: 'Cart cleared',
            data: cart,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/cart/summary
// @desc    Get cart summary (totals only)
// @access  Private
router.get('/summary', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.json({
                success: true,
                data: {
                    totalItems: 0,
                    totalPrice: 0,
                },
            });
        }

        res.json({
            success: true,
            data: {
                totalItems: cart.totalItems,
                totalPrice: cart.totalPrice,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
