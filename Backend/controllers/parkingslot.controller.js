const ParkingSlot = require('../models/parkingslot.model');

const createParkingSlot = async (req, res) => {
    try {
        let { slotNumber, vehicleType, hourlyRate, status } = req.body;
        let letter = slotNumber[0];
        const numPart = slotNumber.slice(1);

        // Only shift if user is entering A–D manually
        if (vehicleType === 'car') {
            if (letter >= 'A' && letter <= 'D') {
                letter = String.fromCharCode(letter.charCodeAt(0) + 4); // A→E, B→F, C→G, D→H
            }
        } else if (vehicleType === 'truck') {
            if (letter >= 'A' && letter <= 'D') {
                letter = String.fromCharCode(letter.charCodeAt(0) + 10); // A→K, B→L, C→M, D→N
            }
        }

        const finalSlotNumber = letter + numPart;

        const slotData = {
            slotNumber: finalSlotNumber,
            vehicleType,
            hourlyRate,
            status
        };

        const slot = new ParkingSlot(slotData);
        await slot.save();
        res.status(201).json(slot);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



const getAllParkingSlots = async (req, res) => {
    try {
        const slots = await ParkingSlot.find();
        res.json(slots);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getParkingSlotById = async (req, res) => {
    try {
        const slot = await ParkingSlot.findById(req.params.id);
        if (!slot) return res.status(404).json({ error: 'Parking slot not found' });
        res.json(slot);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateParkingSlot = async (req, res) => {
    try {
        const { slotNumber, status, vehicleType, hourlyRate } = req.body;
        const updateData = { slotNumber, status, vehicleType, hourlyRate };
        const slot = await ParkingSlot.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!slot) return res.status(404).json({ error: 'Parking slot not found' });
        res.json(slot);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteParkingSlot = async (req, res) => {
    try {
        const slot = await ParkingSlot.findByIdAndDelete(req.params.id);
        if (!slot) return res.status(404).json({ error: 'Parking slot not found' });
        res.json({ message: 'Parking slot deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAvailableSlots = async (req, res) => {
    try {
        const slots = await ParkingSlot.find({ status: 'available' });
        res.json(slots);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createParkingSlot,
    getAllParkingSlots,
    getParkingSlotById,
    updateParkingSlot,
    deleteParkingSlot,
    getAvailableSlots
};