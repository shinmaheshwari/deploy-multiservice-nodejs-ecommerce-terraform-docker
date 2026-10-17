const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce_orders', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));

// Health check
app.get('/health', (req, res) => {
  res.json({ service: 'Order Service', status: 'OK', port: PORT });
});

app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});