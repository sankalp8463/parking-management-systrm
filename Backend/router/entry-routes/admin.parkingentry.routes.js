const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { 
    parkVehicle, 
    exitVehicle, 
    exitVehicleByNumber,
    getActiveEntries, 
    getAllEntries 
} = require('../../controllers/admin.parkingentry.controller');

router.post('/park', auth, parkVehicle);
router.put('/exit/:entryId', auth, exitVehicle);
router.post('/exit-by-vehicle', auth, exitVehicleByNumber);
router.get('/active', auth, getActiveEntries);
router.get('/', auth, getAllEntries);

module.exports = router;