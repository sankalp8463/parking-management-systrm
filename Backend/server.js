require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const userRoutes = require('./router/entry-routes/user.routes');
const vehicleRoutes = require('./router/entry-routes/vehicle.routes');
const parkingSlotRoutes = require('./router/entry-routes/parkingslot.routes');
const parkingEntryRoutes = require('./router/entry-routes/parkingentry.routes');
const paymentRoutes = require('./router/entry-routes/payment.routes');
const billRoutes = require('./router/entry-routes/bill.routes');
const parkingHistoryRoutes = require('./router/entry-routes/parkinghistory.routes');
const receiptRoutes = require('./router/entry-routes/receipt.routes');

const app = express();

// Configuration
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/parking-slots', parkingSlotRoutes);
app.use('/api/parking-entries', parkingEntryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/parking-history', parkingHistoryRoutes);
app.use('/api/receipts', receiptRoutes);

// Database connection

// Start server
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

// Initialize application
connectDB().then(startServer);
