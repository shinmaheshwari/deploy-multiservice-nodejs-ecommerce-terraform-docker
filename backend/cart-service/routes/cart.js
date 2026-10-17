const express = require('express');
const axios = require('axios');
const Cart = require('../models/Cart');

const router = express.Router();

// Product Service URL
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

// Helper function to get product details
const getProductDetails = async (productId) => {
  try {
    const response = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product details:', error.message);
    return null;
  }
};

// @route   GET /api/cart/:userId
// @desc    Get user's cart
// @access  Private
router.get('/:userId', async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.params.userId });
    
    if (!cart) {
      cart = new Cart({ userId: req.params.userId });
      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/cart/:userId/items
// @desc    Add item to cart
// @access  Private
router.post('/:userId/items', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    // Get product details from Product Service
    const product = await getProductDetails(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product has enough stock
    if (product.inventory.stock < quantity) {
      return res.status(400).json({ 
        message: 'Insufficient stock',
        availableStock: product.inventory.stock 
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) {
      cart = new Cart({ userId: req.params.userId });
    }

    // Add item to cart
    const productDetails = {
      name: product.name,
      image: product.images[0]?.url || '',
      sku: product.inventory.sku
    };

    cart.addItem(productId, quantity, product.price, productDetails);
    await cart.save();

    res.json({
      message: 'Item added to cart successfully',
      cart
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/cart/:userId/items/:productId
// @desc    Update item quantity in cart
// @access  Private
router.put('/:userId/items/:productId', async (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (quantity < 0) {
      return res.status(400).json({ message: 'Quantity must be positive' });
    }

    // Get product details to check stock
    if (quantity > 0) {
      const product = await getProductDetails(req.params.productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (product.inventory.stock < quantity) {
        return res.status(400).json({ 
          message: 'Insufficient stock',
          availableStock: product.inventory.stock 
        });
      }
    }

    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.updateItemQuantity(req.params.productId, quantity);
    await cart.save();

    res.json({
      message: 'Cart updated successfully',
      cart
    });

  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/cart/:userId/items/:productId
// @desc    Remove item from cart
// @access  Private
router.delete('/:userId/items/:productId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.removeItem(req.params.productId);
    await cart.save();

    res.json({
      message: 'Item removed from cart successfully',
      cart
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/cart/:userId
// @desc    Clear entire cart
// @access  Private
router.delete('/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.clearCart();
    await cart.save();

    res.json({
      message: 'Cart cleared successfully',
      cart
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/cart/:userId/validate
// @desc    Validate cart items (check stock, prices)
// @access  Private
router.post('/:userId/validate', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const validationResults = [];
    let isValid = true;

    for (const item of cart.items) {
      const product = await getProductDetails(item.productId);
      
      if (!product) {
        validationResults.push({
          productId: item.productId,
          error: 'Product not found',
          action: 'remove'
        });
        isValid = false;
      } else if (product.inventory.stock < item.quantity) {
        validationResults.push({
          productId: item.productId,
          error: 'Insufficient stock',
          availableStock: product.inventory.stock,
          requestedQuantity: item.quantity,
          action: 'update_quantity'
        });
        isValid = false;
      } else if (product.price !== item.price) {
        validationResults.push({
          productId: item.productId,
          error: 'Price changed',
          oldPrice: item.price,
          newPrice: product.price,
          action: 'update_price'
        });
        isValid = false;
      }
    }

    res.json({
      isValid,
      validationResults,
      cart
    });

  } catch (error) {
    console.error('Validate cart error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;