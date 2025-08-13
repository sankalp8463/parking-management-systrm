const ParkingHistory = require('../models/parkinghistory.model');

const getAllHistory = async (req, res) => {
    try {
        const history = await ParkingHistory.find().populate('vehicleInfo.userId').sort({ archivedAt: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getHistoryById = async (req, res) => {
    try {
        const history = await ParkingHistory.findById(req.params.id).populate('vehicleInfo.userId');
        if (!history) return res.status(404).json({ error: 'History record not found' });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getUserHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const history = await ParkingHistory.find({ 'vehicleInfo.userId': userId }).sort({ archivedAt: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllHistory,
    getHistoryById,
    getUserHistory
};