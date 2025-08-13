const Payment = require('../models/payment.model');

const createPayment = async (req, res) => {
    try {
        const { vehicleNumber, paymentMethod, transactionId, amountPaid } = req.body;
        const paymentData = { 
            vehicleNumber, 
            paymentMethod, 
            transactionId, 
            amountPaid, 
            paymentStatus: 'completed',
            paymentDate: new Date()
        };
        const payment = new Payment(paymentData);
        await payment.save();
        res.status(201).json(payment);
    } catch (error) {
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
    createPayment,
    getAllPayments,
    getPaymentById,
    updatePayment,
    deletePayment
};