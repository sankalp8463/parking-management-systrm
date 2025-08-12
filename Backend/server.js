const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const userRoutes = require('./router/entry-routes/user.routes');
const vehicleRoutes = require('./router/entry-routes/vehicle.routes');
const parkingSlotRoutes = require('./router/entry-routes/parkingslot.routes');
const parkingEntryRoutes = require('./router/entry-routes/parkingentry.routes');
const paymentRoutes = require('./router/entry-routes/payment.routes');
const billRoutes = require('./router/entry-routes/bill.routes');

const app = express();

// Configuration
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/parking-system';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/parking-slots', parkingSlotRoutes);
app.use('/api/parking-entries', parkingEntryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bills', billRoutes);

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Start server
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

// Initialize application
connectDB().then(startServer);
