const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const Property = require('../models/Property');

const TRIPO_API_BASE = 'https://api.tripo3d.ai/v2/openapi';

// Ensure models directory exists
const modelsDir = path.join(__dirname, '../uploads/models');
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

// POST /api/tripo/generate — Start 3D model generation from an image URL
router.post('/generate', auth, async (req, res) => {
  try {
    const { imageUrl, propertyId } = req.body;
    const apiKey = process.env.TRIPO_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ message: 'Tripo AI API key not configured. Add TRIPO_API_KEY to your environment.' });
    }

    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    // Step 1: Upload image to Tripo via URL
    // The Tripo API accepts a direct image URL for image_to_model
    const response = await axios.post(
      `${TRIPO_API_BASE}/task`,
      {
        type: 'image_to_model',
        file: {
          type: 'jpg',
          url: imageUrl
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    if (response.data.code !== 0) {
      return res.status(400).json({ message: 'Tripo AI error: ' + (response.data.message || 'Unknown error') });
    }

    const taskId = response.data.data.task_id;
    res.json({ taskId, message: '3D model generation started!' });

  } catch (err) {
    console.error('Tripo generate error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to start 3D generation: ' + (err.response?.data?.message || err.message) });
  }
});

// GET /api/tripo/status/:taskId — Check generation status
router.get('/status/:taskId', auth, async (req, res) => {
  try {
    const apiKey = process.env.TRIPO_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ message: 'Tripo AI API key not configured' });
    }

    const response = await axios.get(
      `${TRIPO_API_BASE}/task/${req.params.taskId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    if (response.data.code !== 0) {
      return res.status(400).json({ message: 'Tripo AI error' });
    }

    const taskData = response.data.data;
    const status = taskData.status; // queued, running, success, failed

    if (status === 'success') {
      // The model is ready — get the rendered model output
      const modelOutput = taskData.output;
      
      if (modelOutput && modelOutput.model) {
        res.json({
          status: 'success',
          modelUrl: modelOutput.model, // Direct URL to the GLB from Tripo
          message: '3D model generated successfully!'
        });
      } else {
        res.json({ status: 'success', message: 'Model completed but no output URL found' });
      }
    } else if (status === 'failed') {
      res.json({ status: 'failed', message: 'Model generation failed. Try with a different image.' });
    } else {
      // Still processing (queued or running)
      res.json({ status, message: `Model is ${status}...` });
    }
  } catch (err) {
    console.error('Tripo status error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to check status' });
  }
});

// POST /api/tripo/save — Download and save the 3D model, update property
router.post('/save', auth, async (req, res) => {
  try {
    const { modelUrl, propertyId } = req.body;

    if (!modelUrl || !propertyId) {
      return res.status(400).json({ message: 'modelUrl and propertyId are required' });
    }

    // Download the GLB file from Tripo's CDN
    const response = await axios.get(modelUrl, { responseType: 'stream' });
    const filename = `model-${propertyId}-${Date.now()}.glb`;
    const filepath = path.join(modelsDir, filename);

    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    const localModelUrl = `/uploads/models/${filename}`;

    // Update the property with the model URL
    await Property.findByIdAndUpdate(propertyId, { model_3d_url: localModelUrl });

    res.json({ model_3d_url: localModelUrl, message: '3D model saved to property!' });
  } catch (err) {
    console.error('Tripo save error:', err.message);
    res.status(500).json({ message: 'Failed to save 3D model' });
  }
});

module.exports = router;
