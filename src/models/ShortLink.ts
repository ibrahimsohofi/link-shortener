import mongoose from 'mongoose';

const ShortLinkSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  clicks: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  customSlug: {
    type: Boolean,
    default: false,
  },
  analytics: {
    referrers: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    browsers: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    devices: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    countries: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    clicksByDate: {
      type: Map,
      of: Number,
      default: new Map(),
    },
  },
});

export default mongoose.models.ShortLink || mongoose.model('ShortLink', ShortLinkSchema);
