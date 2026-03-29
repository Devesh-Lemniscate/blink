import mongoose from "mongoose";

const clickDetailSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  deviceType: { type: String, enum: ['desktop', 'mobile', 'tablet'], default: 'desktop' },
  browser: { type: String, default: 'unknown' },
  os: { type: String, default: 'unknown' },
  referer: { type: String, default: 'direct' },
}, { _id: false });

const shortUrlSchema = new mongoose.Schema({
  full_url: {
    type: String,
    required: true,
  },
  short_url: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  clicks: {
    type: Number,
    required: true,
    default: 0,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true,
  },
  clickDetails: {
    type: [clickDetailSchema],
    default: [],
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Compound index for faster user queries
shortUrlSchema.index({ user: 1, createdAt: -1 });

const shortUrl = mongoose.model("shortUrl", shortUrlSchema);

export default shortUrl;
