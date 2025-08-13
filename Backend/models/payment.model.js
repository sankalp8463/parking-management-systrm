// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    vehicleNumber: { type: String, required: true },
    paymentMethod: { type: String, enum: ['online', 'cash'], required: true },
    transactionId: { type: String }, // Transaction ID or null for cash
    amountPaid: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
    paymentDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
