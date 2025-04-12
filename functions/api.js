const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const mongoose = require('mongoose');
const shortid = require('shortid');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create simplified Link model
const linkSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortCode: { type: String, required: true, default: shortid.generate, unique: true },
  customShortCode: { type: String, unique: true, sparse: true },
  clicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Define URL generation method
linkSchema.methods.getShortUrl = function() {
  const baseUrl = process.env.URL || 'https://linkshortener.netlify.app';
  return `${baseUrl}/s/${this.customShortCode || this.shortCode}`;
};

// Initialize the model
let Link;
try {
  // Try to use existing model first
  Link = mongoose.model('Link');
} catch (error) {
  // If not found, create new model
  Link = mongoose.model('Link', linkSchema);
}

// Create a new shortened URL for anonymous users
app.post('/api/links/anonymous', async (req, res) => {
  try {
    const { originalUrl, customShortCode } = req.body;

    // Validate URL format
    try {
      new URL(originalUrl);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid URL format' });
    }

    // Create the shortened link
    const link = {
      originalUrl,
      ...(customShortCode && { customShortCode }),
      shortCode: customShortCode || shortid.generate(),
      clicks: 0,
      createdAt: new Date()
    };

    // Since we're not using a database in the serverless function,
    // we'll return a mock response
    res.status(201).json({
      shortUrl: `${process.env.URL || 'https://linkshortener.netlify.app'}/s/${link.shortCode}`,
      originalUrl: link.originalUrl,
      shortCode: link.shortCode,
      id: 'temporary-id-' + shortid.generate(),
      clicks: 0,
      createdAt: link.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a link by shortCode
app.get('/api/links/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  // In a serverless function without a database, we need to redirect to a mock URL
  // In a real implementation, you'd look up the link in your database
  res.json({
    originalUrl: 'https://example.com',
    shortCode,
    clicks: 1
  });
});

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'API is running' });
});

// Export the serverless function
module.exports.handler = serverless(app);
