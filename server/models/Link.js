const mongoose = require('mongoose');
const shortid = require('shortid');

// Analytics item schema for detailed tracking
const analyticsItemSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String,
  referrer: String,
  country: String,
  device: String,
  browser: String,
  os: String,
  // For campaign tracking
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,
  utmTerm: String,
  utmContent: String
});

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
  analytics: [analyticsItemSchema],
  // For bulk operations
  bulkGroupId: {
    type: String,
    index: true,
    sparse: true,
  },
  tags: [String],
  title: String,
  description: String,
  active: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null,
    index: true,
    sparse: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // QR code options
  qrCodeOptions: {
    foregroundColor: {
      type: String,
      default: '#000000'
    },
    backgroundColor: {
      type: String,
      default: '#FFFFFF'
    },
    logoUrl: String,
    size: {
      type: Number,
      default: 200
    }
  }
}, { timestamps: true });

// Create a compound index for user + originalUrl to prevent duplicates per user
linkSchema.index({ user: 1, originalUrl: 1 });

// Index for tags to improve performance of tag-based queries
linkSchema.index({ tags: 1 });

// Define a function to generate the full shortened URL
linkSchema.methods.getShortUrl = function() {
  const baseUrl = process.env.NODE_ENV === 'production'
    ? (process.env.BASE_URL || 'http://localhost:5000')
    : 'http://localhost:5173';

  return `${baseUrl}/s/${this.customShortCode || this.shortCode}`;
};

// Method to add an analytics record
linkSchema.methods.addAnalytics = async function(data) {
  this.clicks += 1;
  this.analytics.push(data);

  // If we have too many analytics records, keep only the most recent ones
  const MAX_ANALYTICS = 1000; // Limit for performance reasons
  if (this.analytics.length > MAX_ANALYTICS) {
    this.analytics = this.analytics.slice(-MAX_ANALYTICS);
  }

  return this.save();
};

// Static method for bulk creation
linkSchema.statics.createBulk = async function(urls, userId, options = {}) {
  // Generate a group ID for this bulk operation
  const bulkGroupId = shortid.generate();

  const links = urls.map(url => ({
    originalUrl: url,
    user: userId,
    bulkGroupId,
    ...options
  }));

  return this.insertMany(links);
};

const Link = mongoose.model('Link', linkSchema);

module.exports = Link;
