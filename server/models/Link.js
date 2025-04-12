const mongoose = require('mongoose');
const shortid = require('shortid');

const linkSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  shortCode: {
    type: String,
    required: true,
    default: shortid.generate,
    unique: true,
  },
  customShortCode: {
    type: String,
    unique: true,
    sparse: true, // only enforce uniqueness if field exists
  },
  clicks: {
    type: Number,
    default: 0,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  analytics: [
    {
      timestamp: { type: Date, default: Date.now },
      ipAddress: String,
      userAgent: String,
      referrer: String,
      country: String,
      device: String,
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 31536000, // 1 year in seconds (optional - for auto cleanup)
  },
}, { timestamps: true });

// Create a compound index for user + originalUrl to prevent duplicates per user
linkSchema.index({ user: 1, originalUrl: 1 });

// Define a function to generate the full shortened URL
linkSchema.methods.getShortUrl = function() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  return `${baseUrl}/api/links/${this.customShortCode || this.shortCode}`;
};

const Link = mongoose.model('Link', linkSchema);

module.exports = Link;
