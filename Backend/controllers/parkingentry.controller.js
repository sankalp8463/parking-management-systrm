const ParkingEntry = require('../models/parkingentry.model');
const ParkingSlot = require('../models/parkingslot.model');
const Vehicle = require('../models/vehicle.nodel');

const parkVehicle = async (req, res) => {
    try {
        const { vehicleNumber, vehicleType } = req.body;
        
        let vehicle = await Vehicle.findOne({ vehicleNumber });
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        
        const availableSlot = await ParkingSlot.findOne({ 
            status: 'available', 
            vehicleType 
        });
        
        if (!availableSlot) {
            return res.status(400).json({ error: 'No available slots for this vehicle type' });
        }
        
        const entry = new ParkingEntry({
            vehicleId: vehicle._id,
            slotId: availableSlot._id,
            entryTime: new Date(),
            status: 'active'
        });
        
        availableSlot.status = 'occupied';
        
        await Promise.all([entry.save(), availableSlot.save()]);
        await entry.populate(['vehicleId', 'slotId']);
        
        res.status(201).json(entry);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const exitVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        
        const entry = await ParkingEntry.findById(id).populate('slotId');
        if (!entry) {
            return res.status(404).json({ error: 'Parking entry not found' });
        }
        
        if (entry.status === 'completed') {
            return res.status(400).json({ error: 'Vehicle already exited' });
        }
        
        const exitTime = new Date();
        const totalHours = Math.ceil((exitTime - entry.entryTime) / (1000 * 60 * 60));
        const totalAmount = totalHours * entry.slotId.hourlyRate;
        
        entry.exitTime = exitTime;
        entry.totalHours = totalHours;
        entry.totalAmount = totalAmount;
        entry.status = 'completed';
        
        entry.slotId.status = 'available';
        
        await Promise.all([entry.save(), entry.slotId.save()]);
        await entry.populate(['vehicleId', 'slotId']);
        
        res.json(entry);
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

const getActiveEntries = async (req, res) => {
    try {
        const entries = await ParkingEntry.find({ status: 'active' }).populate(['vehicleId', 'slotId']);
        res.json(entries);
    } catch (error) {
        res.status(500).json({ error: error.message });
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

module.exports = {
    parkVehicle,
    exitVehicle,
    getAllParkingEntries,
    getParkingEntryById,
    getActiveEntries,
    deleteParkingEntry
};