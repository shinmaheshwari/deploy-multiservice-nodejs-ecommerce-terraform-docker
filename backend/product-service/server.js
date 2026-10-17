const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce_products', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));

// Health check
app.get('/health', (req, res) => {
  res.json({ service: 'Product Service', status: 'OK', port: PORT });
});

app.listen(PORT, () => {
  console.log(`Product Service running on port ${PORT}`);
});