const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  property_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' }
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
