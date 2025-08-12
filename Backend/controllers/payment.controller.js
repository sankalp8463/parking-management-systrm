const Payment = require('../models/payment.model');

const createPayment = async (req, res) => {
    try {
        const { entryId, paymentMethod, transactionId, amountPaid, paymentStatus, paymentDate } = req.body;
        const paymentData = { entryId, paymentMethod, transactionId, amountPaid, paymentStatus, paymentDate };
        const payment = new Payment(paymentData);
        await payment.save();
        await payment.populate('entryId');
        res.status(201).json(payment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find().populate('entryId');
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id).populate('entryId');
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