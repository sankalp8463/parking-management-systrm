const ParkingEntry = require('../models/parkingentry.model');

const createParkingEntry = async (req, res) => {
    try {
        const { vehicleId, slotId, entryTime, exitTime, totalHours, totalAmount, status } = req.body;
        const entryData = { vehicleId, slotId, entryTime, exitTime, totalHours, totalAmount, status };
        const parkingEntry = new ParkingEntry(entryData);
        await parkingEntry.save();
        await parkingEntry.populate(['vehicleId', 'slotId']);
        res.status(201).json(parkingEntry);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAllParkingEntries = async (req, res) => {
    try {
        const entries = await ParkingEntry.find().populate(['vehicleId', 'slotId']);
        res.json(entries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getParkingEntryById = async (req, res) => {
    try {
        const entry = await ParkingEntry.findById(req.params.id).populate(['vehicleId', 'slotId']);
        if (!entry) return res.status(404).json({ error: 'Parking entry not found' });
        res.json(entry);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateParkingEntry = async (req, res) => {
    try {
        const { vehicleId, slotId, entryTime, exitTime, totalHours, totalAmount, status } = req.body;
        const updateData = { vehicleId, slotId, entryTime, exitTime, totalHours, totalAmount, status };
        const entry = await ParkingEntry.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate(['vehicleId', 'slotId']);
        
        if (!entry) return res.status(404).json({ error: 'Parking entry not found' });
        res.json(entry);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteParkingEntry = async (req, res) => {
    try {
        const entry = await ParkingEntry.findByIdAndDelete(req.params.id);
        if (!entry) return res.status(404).json({ error: 'Parking entry not found' });
        res.json({ message: 'Parking entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getActiveEntries = async (req, res) => {
    try {
        const entries = await ParkingEntry.find({ status: 'active' }).populate(['vehicleId', 'slotId']);
        res.json(entries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createParkingEntry,
    getAllParkingEntries,
    getParkingEntryById,
    updateParkingEntry,
    deleteParkingEntry,
    getActiveEntries
};