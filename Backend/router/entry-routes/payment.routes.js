const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyPayment, createPayment, getAllPayments, getPaymentById, updatePayment, deletePayment } = require('../../controllers/payment.controller');

router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);
router.post('/', createPayment);
router.get('/', getAllPayments);
router.get('/:id', getPaymentById);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);

module.exports = router;