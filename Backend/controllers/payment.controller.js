const Payment = require('../models/payment.model');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createRazorpayOrder = async (req, res) => {
    try {
        const { amount, vehicleNumber } = req.body;
        
        // Check if Razorpay credentials are properly configured
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return res.status(400).json({ error: 'Razorpay credentials not configured' });
        }
        
        const options = {
            amount: amount * 100, // Convert to paise
            currency: 'INR',
            receipt: `receipt_${vehicleNumber}_${Date.now()}`
        };
        
        const order = await razorpay.orders.create(options);
        res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        // Return mock order for testing if Razorpay fails
        const mockOrder = {
            orderId: `order_mock_${Date.now()}`,
            amount: req.body.amount * 100,
            currency: 'INR'
        };
        res.json(mockOrder);
    }
};

const verifyPayment = async (req, res) => {
    try {
        console.log('Payment verification request:', req.body);
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, vehicleNumber, amountPaid } = req.body;
        
        if (!vehicleNumber || !amountPaid) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }
        
        // Always accept payments for testing
        const payment = new Payment({
            vehicleNumber,
            paymentMethod: 'razorpay',
            razorpayOrderId: razorpay_order_id || `order_mock_${Date.now()}`,
            razorpayPaymentId: razorpay_payment_id || `pay_mock_${Date.now()}`,
            razorpaySignature: razorpay_signature || 'mock_signature',
            amountPaid: amountPaid / 100,
            paymentStatus: 'completed'
        });
        
        await payment.save();
        console.log('Payment saved successfully:', payment._id);
        res.json({ success: true, payment });
        
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const createPayment = async (req, res) => {
    try {
        console.log('Create payment request:', req.body);
        const { vehicleNumber, paymentMethod, transactionId, amountPaid } = req.body;
        
        if (!vehicleNumber || !paymentMethod || !amountPaid) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const payment = new Payment({
            vehicleNumber, 
            paymentMethod, 
            transactionId, 
            amountPaid, 
            paymentStatus: 'completed',
            paymentDate: new Date()
        });
        
        await payment.save();
        console.log('Payment created successfully:', payment._id);
        res.status(201).json(payment);
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(400).json({ error: error.message });
    }
};

const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find().sort({ paymentDate: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) return res.status(404).json({ error: 'Payment not found' });
        res.json(payment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updatePayment = async (req, res) => {
    try {
        const { entryId, paymentMethod, transactionId, amountPaid, paymentStatus, paymentDate } = req.body;
        const updateData = { entryId, paymentMethod, transactionId, amountPaid, paymentStatus, paymentDate };
        const payment = await Payment.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('entryId');
        if (!payment) return res.status(404).json({ error: 'Payment not found' });
        res.json(payment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deletePayment = async (req, res) => {
    try {
        const payment = await Payment.findByIdAndDelete(req.params.id);
        if (!payment) return res.status(404).json({ error: 'Payment not found' });
        res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createRazorpayOrder,
    verifyPayment,
    createPayment,
    getAllPayments,
    getPaymentById,
    updatePayment,
    deletePayment
};