const express = require('express');
const Order = require('../models/Order');

const router = express.Router();

// @route   POST /api/payments/process
// @desc    Process payment for order
// @access  Private
router.post('/process', async (req, res) => {
  try {
    const {
      orderId,
      paymentMethod,
      paymentDetails
    } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Order already paid' });
    }

    // Simulate payment processing
    const paymentResult = await processPayment(order, paymentMethod, paymentDetails);

    if (paymentResult.success) {
      order.markAsPaid(paymentResult.transactionId, paymentResult.gateway);
      await order.save();

      res.json({
        message: 'Payment processed successfully',
        transactionId: paymentResult.transactionId,
        order
      });
    } else {
      order.paymentStatus = 'failed';
      await order.save();

      res.status(400).json({
        message: 'Payment failed',
        error: paymentResult.error
      });
    }

  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/payments/refund
// @desc    Process refund for order
// @access  Admin
router.post('/refund', async (req, res) => {
  try {
    const { orderId, amount, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Order is not paid' });
    }

    // Simulate refund processing
    const refundResult = await processRefund(order, amount, reason);

    if (refundResult.success) {
      order.paymentStatus = 'refunded';
      order.status = 'refunded';
      order.notes = `Refunded: ${reason}`;
      await order.save();

      res.json({
        message: 'Refund processed successfully',
        refundId: refundResult.refundId,
        order
      });
    } else {
      res.status(400).json({
        message: 'Refund failed',
        error: refundResult.error
      });
    }

  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/payments/order/:orderId
// @desc    Get payment details for order
// @access  Private
router.get('/order/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      paymentDetails: order.paymentDetails,
      total: order.pricing.total
    });

  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper functions for payment processing
async function processPayment(order, paymentMethod, paymentDetails) {
  // Simulate payment gateway processing
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate 95% success rate
      const success = Math.random() > 0.05;
      
      if (success) {
        resolve({
          success: true,
          transactionId: generateTransactionId(),
          gateway: getPaymentGateway(paymentMethod)
        });
      } else {
        resolve({
          success: false,
          error: 'Payment declined by bank'
        });
      }
    }, 1000); // Simulate processing delay
  });
}

async function processRefund(order, amount, reason) {
  // Simulate refund processing
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        refundId: generateTransactionId(),
        amount: amount || order.pricing.total
      });
    }, 1500); // Simulate processing delay
  });
}

function generateTransactionId() {
  return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getPaymentGateway(paymentMethod) {
  const gateways = {
    credit_card: 'Stripe',
    debit_card: 'Stripe',
    paypal: 'PayPal',
    bank_transfer: 'ACH',
    cash_on_delivery: 'COD'
  };
  return gateways[paymentMethod] || 'Unknown';
}

module.exports = router;