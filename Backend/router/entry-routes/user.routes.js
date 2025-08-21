const express = require('express');
const router = express.Router();
const { register, login, getAllUsers, getUserById, updateUser, createUser, deleteUser } = require('../../controllers/user.controller');

router.post('/register', register);
router.post('/login', login);
router.post('/', createUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;