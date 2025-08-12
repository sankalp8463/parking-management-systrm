const express = require('express');
const router = express.Router();
const Bill = require('../../models/bill.model');

router.post('/', async (req, res) => {
    try {
        const { paymentId, billNumber, generatedAt, billUrl, status } = req.body;
        const billData = { paymentId, billNumber, generatedAt, billUrl, status };
        const bill = new Bill(billData);
        await bill.save();
        await bill.populate('paymentId');
        res.status(201).json(bill);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const bills = await Bill.find().populate('paymentId');
        res.json(bills);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id).populate('paymentId');
        if (!bill) return res.status(404).json({ error: 'Bill not found' });
        res.json(bill);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { paymentId, billNumber, generatedAt, billUrl, status } = req.body;
        const updateData = { paymentId, billNumber, generatedAt, billUrl, status };
        const bill = await Bill.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('paymentId');
        if (!bill) return res.status(404).json({ error: 'Bill not found' });
        res.json(bill);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const bill = await Bill.findByIdAndDelete(req.params.id);
        if (!bill) return res.status(404).json({ error: 'Bill not found' });
        res.json({ message: 'Bill deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;