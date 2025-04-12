const Link = require('../models/Link');
const shortid = require('shortid');

// Create a new shortened URL
exports.createLink = async (req, res) => {
  try {
    const { originalUrl, customShortCode } = req.body;

    // Validate URL format
    try {
      new URL(originalUrl);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid URL format' });
    }

    // If custom short code is provided, check if it's available
    if (customShortCode) {
      const existingLink = await Link.findOne({
        $or: [
          { shortCode: customShortCode },
          { customShortCode: customShortCode }
        ]
      });

      if (existingLink) {
        return res.status(400).json({ message: 'Custom code already in use' });
      }
    }

    // Create the shortened link
    const link = new Link({
      originalUrl,
      ...(customShortCode && { customShortCode }),
      user: req.userId
    });

    await link.save();

    res.status(201).json({
      shortUrl: link.getShortUrl(),
      originalUrl: link.originalUrl,
      shortCode: customShortCode || link.shortCode,
      id: link._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Redirect to the original URL
exports.redirectToOriginalUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const link = await Link.findOne({
      $or: [
        { shortCode },
        { customShortCode: shortCode }
      ]
    });

    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    // Update click count
    link.clicks += 1;

    // Add analytics data
    const analytics = {
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      referrer: req.headers.referer || 'direct',
      country: req.headers['cf-ipcountry'] || 'unknown',
      device: req.device?.type || 'unknown',
    };

    link.analytics.push(analytics);
    await link.save();

    // Redirect to the original URL
    return res.redirect(link.originalUrl);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all links for the authenticated user
exports.getLinks = async (req, res) => {
  try {
    const links = await Link.find({ user: req.userId })
      .sort({ createdAt: -1 });

    const formattedLinks = links.map(link => ({
      id: link._id,
      originalUrl: link.originalUrl,
      shortUrl: link.getShortUrl(),
      shortCode: link.customShortCode || link.shortCode,
      clicks: link.clicks,
      createdAt: link.createdAt
    }));

    res.json(formattedLinks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single link by ID
exports.getLinkById = async (req, res) => {
  try {
    const link = await Link.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    res.json({
      id: link._id,
      originalUrl: link.originalUrl,
      shortUrl: link.getShortUrl(),
      shortCode: link.customShortCode || link.shortCode,
      clicks: link.clicks,
      analytics: link.analytics,
      createdAt: link.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a link
exports.deleteLink = async (req, res) => {
  try {
    const link = await Link.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get analytics for a link
exports.getLinkAnalytics = async (req, res) => {
  try {
    const link = await Link.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    // Process analytics data
    const clicksPerDay = {};
    const userAgents = {};
    const referrers = {};
    const countries = {};

    link.analytics.forEach(item => {
      // Format date to YYYY-MM-DD
      const date = new Date(item.timestamp).toISOString().split('T')[0];
      clicksPerDay[date] = (clicksPerDay[date] || 0) + 1;

      // Count user agents
      userAgents[item.userAgent] = (userAgents[item.userAgent] || 0) + 1;

      // Count referrers
      referrers[item.referrer] = (referrers[item.referrer] || 0) + 1;

      // Count countries
      countries[item.country] = (countries[item.country] || 0) + 1;
    });

    res.json({
      id: link._id,
      originalUrl: link.originalUrl,
      shortUrl: link.getShortUrl(),
      shortCode: link.customShortCode || link.shortCode,
      totalClicks: link.clicks,
      clicksPerDay,
      userAgents,
      referrers,
      countries,
      createdAt: link.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
