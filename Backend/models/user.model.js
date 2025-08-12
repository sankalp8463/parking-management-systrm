// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String },
    role: { type: String, enum: ['customer', 'staff', 'admin'], default: 'customer' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
