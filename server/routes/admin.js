const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Property = require('../models/Property');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Apply auth and admin middleware to all routes in this file
router.use(auth);
router.use(admin);

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// DELETE /api/admin/user/:id
router.delete('/user/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    // Also delete their properties? For now just delete user.
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// GET /api/admin/properties
router.get('/properties', async (req, res) => {
  try {
    const properties = await Property.find().populate('owner_id', 'name email');
    res.json(properties);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// DELETE /api/admin/property/:id
router.delete('/property/:id', async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Property deleted' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// PUT /api/admin/property/:id/status
router.put('/property/:id/status', async (req, res) => {
  try {
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: { status: req.body.status } },
      { new: true }
    );
    res.json(updatedProperty);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
