const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  initiator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  offeredStamps: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stamp'
  }],
  requestedStamps: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stamp'
  }],
  message: {
    type: String,
    default: '',
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: {
      type: String,
      default: ''
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date
    }
  },
  counterOffer: {
    message: { type: String, default: '' },
    offeredStamps: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stamp'
    }],
    requestedStamps: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stamp'
    }]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Trade', tradeSchema);
