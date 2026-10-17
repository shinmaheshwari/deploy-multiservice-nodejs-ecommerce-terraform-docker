const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  productDetails: {
    name: String,
    image: String,
    sku: String
  }
});

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },
  items: [CartItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update totals before saving
CartItemSchema.pre('save', function(next) {
  this.parent().updateTotals();
  next();
});

CartSchema.methods.updateTotals = function() {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  this.lastModified = new Date();
};

CartSchema.methods.addItem = function(productId, quantity, price, productDetails) {
  const existingItem = this.items.find(item => item.productId.toString() === productId.toString());
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({
      productId,
      quantity,
      price,
      productDetails
    });
  }
  
  this.updateTotals();
};

CartSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(item => item.productId.toString() !== productId.toString());
  this.updateTotals();
};

CartSchema.methods.updateItemQuantity = function(productId, quantity) {
  const item = this.items.find(item => item.productId.toString() === productId.toString());
  
  if (item) {
    if (quantity <= 0) {
      this.removeItem(productId);
    } else {
      item.quantity = quantity;
      this.updateTotals();
    }
  }
};

CartSchema.methods.clearCart = function() {
  this.items = [];
  this.updateTotals();
};

module.exports = mongoose.model('Cart', CartSchema);