const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
};

const register = async (req, res) => {
    try {
        const { name, phoneNumber, email, password, role } = req.body;
        const userData = { name, phoneNumber, email, password, role };
        const user = new User(userData);
        await user.save();
        
        const token = generateToken(user._id);
        const { password: _, ...userWithoutPassword } = user.toObject();
        
        res.status(201).json({ user: userWithoutPassword, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;
        
        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = generateToken(user._id);
        const { password: _, ...userWithoutPassword } = user.toObject();
        
        res.json({ user: userWithoutPassword, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { name, phoneNumber, email, role } = req.body;
        const updateData = { name, phoneNumber, email, role };
        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    register,
    login,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};