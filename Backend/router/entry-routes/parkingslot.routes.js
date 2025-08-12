const express = require('express');
const router = express.Router();
const ParkingSlot = require('../../models/parkingslot.model');

router.post('/', async (req, res) => {
    try {
        const { slotNumber, status, vehicleType, hourlyRate } = req.body;
        const slotData = { slotNumber, status, vehicleType, hourlyRate };
        const slot = new ParkingSlot(slotData);
        await slot.save();
        res.status(201).json(slot);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const slots = await ParkingSlot.find();
        res.json(slots);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const slot = await ParkingSlot.findById(req.params.id);
        if (!slot) return res.status(404).json({ error: 'Parking slot not found' });
        res.json(slot);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { slotNumber, status, vehicleType, hourlyRate } = req.body;
        const updateData = { slotNumber, status, vehicleType, hourlyRate };
        const slot = await ParkingSlot.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!slot) return res.status(404).json({ error: 'Parking slot not found' });
        res.json(slot);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const slot = await ParkingSlot.findByIdAndDelete(req.params.id);
        if (!slot) return res.status(404).json({ error: 'Parking slot not found' });
        res.json({ message: 'Parking slot deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/status/available', async (req, res) => {
    try {
        const slots = await ParkingSlot.find({ status: 'available' });
        res.json(slots);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;