const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const shortid = require('shortid');
const mongoose = require('mongoose');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
let isConnected = false;
const connectToDatabase = async () => {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  try {
    // Use MongoDB Atlas free tier connection string
    // In production, this would be stored as an environment variable
    const dbUri = process.env.MONGODB_URI || 'mongodb+srv://linkshortenerdemo:HfKzyBDFEYxA0lvq@cluster0.eub4mvo.mongodb.net/linkshortener?retryWrites=true&w=majority';

    await mongoose.connect(dbUri);
    isConnected = true;
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Database connection failed' })
    };
  }
};

// Define Link schema
const linkSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },
  clicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  userId: { type: String, default: null },
  analytics: [{
    timestamp: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String,
    referrer: String,
    country: String,
    device: String
  }]
});

// Define URL generation method
linkSchema.methods.getShortUrl = function() {
  const baseUrl = process.env.URL ||
                 (process.env.NETLIFY ? 'https://' + process.env.NETLIFY_SITE_NAME + '.netlify.app' : 'http://localhost:8888');
  return `${baseUrl}/s/${this.shortCode}`;
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

// In-memory cache for frequently accessed links
const linkCache = new Map();

// Debug endpoint to see all links (only for testing)
app.get('/api/debug', async (req, res) => {
  try {
    await connectToDatabase();
    const links = await Link.find().limit(50).sort({ createdAt: -1 });

    res.json({
      links: links.map(link => ({
        id: link._id,
        shortCode: link.shortCode,
        originalUrl: link.originalUrl,
        clicks: link.clicks,
        createdAt: link.createdAt,
        shortUrl: link.getShortUrl()
      })),
      count: links.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new shortened URL for anonymous users
app.post('/api/links/anonymous', async (req, res) => {
  try {
    await connectToDatabase();

    const { originalUrl, customShortCode } = req.body;

    // Validate URL format
    try {
      new URL(originalUrl);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid URL format' });
    }

    // If custom short code is provided, check if it's available
    if (customShortCode) {
      const existingLink = await Link.findOne({ shortCode: customShortCode });
      if (existingLink) {
        return res.status(400).json({ message: 'Custom code already in use' });
      }
    }

    // Generate a short code or use the custom one
    const shortCode = customShortCode || shortid.generate();

    // Create the link in database
    const link = new Link({
      originalUrl,
      shortCode,
      clicks: 0,
      createdAt: new Date()
    });

    await link.save();

    // Add to cache
    linkCache.set(shortCode, {
      originalUrl: link.originalUrl,
      id: link._id.toString(),
      createdAt: link.createdAt
    });

    res.status(201).json({
      shortUrl: link.getShortUrl(),
      originalUrl: link.originalUrl,
      shortCode: link.shortCode,
      id: link._id,
      clicks: 0,
      createdAt: link.createdAt
    });
  } catch (error) {
    console.error('Error creating link:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a link by shortCode and return its information
app.get('/api/links/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Try to get from cache first
    if (linkCache.has(shortCode)) {
      const cachedLink = linkCache.get(shortCode);
      return res.json({
        originalUrl: cachedLink.originalUrl,
        shortCode,
        id: cachedLink.id
      });
    }

    // Not in cache, get from database
    await connectToDatabase();
    const link = await Link.findOne({ shortCode });

    if (!link) {
      return res.status(404).json({
        message: 'Link not found',
        originalUrl: null
      });
    }

    // Add to cache
    linkCache.set(shortCode, {
      originalUrl: link.originalUrl,
      id: link._id.toString(),
      createdAt: link.createdAt
    });

    res.json({
      originalUrl: link.originalUrl,
      shortCode,
      id: link._id,
      clicks: link.clicks
    });
  } catch (error) {
    console.error('Error fetching link:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Direct redirect route for short URLs with analytics tracking
app.get('/s/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Try to get from cache first for faster redirects
    if (linkCache.has(shortCode)) {
      const cachedLink = linkCache.get(shortCode);

      // Redirect immediately, then update stats asynchronously
      setTimeout(async () => {
        await connectToDatabase();
        await Link.findByIdAndUpdate(
          cachedLink.id,
          {
            $inc: { clicks: 1 },
            $push: {
              analytics: {
                timestamp: new Date(),
                ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
                userAgent: req.headers['user-agent'] || 'unknown',
                referrer: req.headers.referer || 'direct',
                country: req.headers['cf-ipcountry'] || 'unknown',
                device: detectDevice(req.headers['user-agent'] || '')
              }
            }
          }
        );
      }, 10);

      return res.redirect(cachedLink.originalUrl);
    }

    // Not in cache, get from database
    await connectToDatabase();
    const link = await Link.findOne({ shortCode });

    if (!link) {
      // Not found, redirect to home page with error
      return res.redirect('/?error=not_found');
    }

    // Add to cache for future requests
    linkCache.set(shortCode, {
      originalUrl: link.originalUrl,
      id: link._id.toString(),
      createdAt: link.createdAt
    });

    // Update click count and analytics
    link.clicks += 1;
    link.analytics.push({
      timestamp: new Date(),
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      referrer: req.headers.referer || 'direct',
      country: req.headers['cf-ipcountry'] || 'unknown',
      device: detectDevice(req.headers['user-agent'] || '')
    });

    // Save asynchronously to not delay the redirect
    link.save().catch(err => console.error('Error saving analytics:', err));

    // Redirect to the original URL
    return res.redirect(link.originalUrl);
  } catch (error) {
    console.error('Error redirecting:', error);
    // In case of error, redirect to home
    return res.redirect('/?error=server_error');
  }
});

// Utility function to detect device type from user agent
function detectDevice(userAgent) {
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile')) return 'mobile';
  if (ua.includes('tablet')) return 'tablet';
  return 'desktop';
}

// Basic health check route
app.get('/api/health', async (req, res) => {
  try {
    await connectToDatabase();
    const linkCount = await Link.countDocuments();

    res.json({
      message: 'API is running',
      environment: process.env.NODE_ENV || 'development',
      netlify: process.env.NETLIFY ? true : false,
      netlifyUrl: process.env.URL || 'not set',
      database: 'connected',
      linkCount
    });
  } catch (error) {
    res.json({
      message: 'API is running but database connection failed',
      error: error.message
    });
  }
});

// Export the serverless function
module.exports.handler = serverless(app);
