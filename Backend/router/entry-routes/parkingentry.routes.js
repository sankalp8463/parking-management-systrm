const express = require('express');
const router = express.Router();
const { createParkingEntry, getAllParkingEntries, getParkingEntryById, updateParkingEntry, deleteParkingEntry, getActiveEntries } = require('../../controllers/parkingentry.controller');

router.post('/', createParkingEntry);
router.get('/', getAllParkingEntries);
router.get('/:id', getParkingEntryById);
router.put('/:id', updateParkingEntry);
router.delete('/:id', deleteParkingEntry);
router.get('/status/active', getActiveEntries);

module.exports = router;