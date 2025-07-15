"use strict";
const { User } = require('../models');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      nik,
      address
    } = req.body;

    const userIdToUpdate = req.params.id;

    if (req.user.role !== 'admin' && req.user.id !== parseInt(userIdToUpdate)) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own account' });
    }

    const user = await User.findByPk(userIdToUpdate);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const hashedPassword = password ? await bcrypt.hash(password, 10) : user.password;

    await user.update({
      name: name ?? user.name,
      email: email ?? user.email,
      password: hashedPassword,
      phone: phone ?? user.phone,
      nik: nik ?? user.nik,
      address: address ?? user.address,
      role: req.user.role === 'admin' ? (role ?? user.role) : user.role
    });

    res.json({
      message: 'User updated',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        nik: user.nik,
        address: user.address
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get profile', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
};