const mongoose = require('mongoose');

const stampSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Stamp title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    required: [true, 'Country of origin is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year of issue is required']
  },
  issueDate: {
    type: String,
    default: ''
  },
  denomination: {
    type: String,
    default: ''
  },
  theme: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: [
      'Definitive', 'Commemorative', 'Special', 'Miniature Sheet',
      'First Day Cover', 'Postal Stationery', 'Revenue', 'Airmail', 'Other'
    ],
    default: 'Other'
  },
  condition: {
    type: String,
    enum: ['Mint', 'Used', 'Cancelled', 'First Day Cover', 'On Cover', 'Other'],
    default: 'Other'
  },
  image: {
    type: String,
    default: ''
  },
  estimatedValue: {
    type: Number,
    default: 0
  },
  rarity: {
    type: String,
    enum: ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Unique'],
    default: 'Common'
  },
  quantity: {
    type: Number,
    default: 1,
    min: 0
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isForTrade: {
    type: Boolean,
    default: false
  },
  isWanted: {
    type: Boolean,
    default: false  // true = this is on a wishlist/wanted list
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Text index for full-text search
stampSchema.index({ title: 'text', description: 'text', country: 'text', theme: 'text', tags: 'text' });

module.exports = mongoose.model('Stamp', stampSchema);
