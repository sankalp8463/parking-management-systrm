// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    entryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingEntry', required: true },
    paymentMethod: { type: String, enum: ['razorpay', 'cash'], required: true },
    transactionId: { type: String }, // Razorpay ID or null for cash
    amountPaid: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    paymentDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
