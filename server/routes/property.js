const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Property = require('../models/Property');
const auth = require('../middleware/auth');

// GET /api/property
router.get('/', async (req, res) => {
  try {
    const properties = await Property.find().populate('owner_id', 'name email').sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET /api/property/:id
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner_id', 'name email');
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(500).send('Server error');
  }
});

// POST /api/property
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, price, location, lat, lng, images, video_url, ai_model_url, owner_name, phone_number, alternate_phone, email } = req.body;

    const newProperty = new Property({
      title,
      description,
      price,
      location,
      lat,
      lng,
      owner_name,
      phone_number,
      alternate_phone,
      email,
      images: images || [],
      video_url,
      ai_model_url,
      owner_id: req.user.id
    });

    const savedProperty = await newProperty.save();

    // Generate QR Code
    const frontendUrl = process.env.FRONTEND_URL || 'https://house-accomodation.vercel.app';
    const propertyUrl = `${frontendUrl}/property/${savedProperty._id}`;
    
    const qrCodeDataUrl = await QRCode.toDataURL(propertyUrl);
    
    // Update property with QR Code
    savedProperty.qr_code_url = qrCodeDataUrl;
    await savedProperty.save();

    res.json(savedProperty);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// PUT /api/property/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner_id.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    // Regenerate QR Code in case the URL or environment has changed
    const frontendUrl = process.env.FRONTEND_URL || 'https://house-accomodation.vercel.app';
    const propertyUrl = `${frontendUrl}/property/${updatedProperty._id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(propertyUrl);
    
    updatedProperty.qr_code_url = qrCodeDataUrl;
    await updatedProperty.save();

    res.json(updatedProperty);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(500).send('Server error');
  }
});

// DELETE /api/property/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check user
    if (property.owner_id.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Property removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
