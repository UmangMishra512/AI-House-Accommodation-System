const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  lat: {
    type: Number,
  },
  lng: {
    type: Number,
  },
  owner_name: {
    type: String,
  },
  phone_number: {
    type: String,
  },
  alternate_phone: {
    type: String,
  },
  email: {
    type: String,
  },
  images: [{
    type: String,
  }],
  video_url: [{
    type: String,
  }],
  ai_model_url: {
    type: String,
  },
  qr_code_url: {
    type: String,
  },
  status: {
    type: String,
    enum: ['available', 'rented'],
    default: 'available'
  },
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
