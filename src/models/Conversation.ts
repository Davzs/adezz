import mongoose, { Schema } from 'mongoose';

const ConversationSchema = new Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    offerStatus: {
      type: String,
      enum: ['none', 'pending', 'accepted', 'rejected', 'expired'],
      default: 'none'
    },
    lastOffer: {
      amount: Number,
      createdAt: Date,
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  }
}, {
  timestamps: true
});

// Ensure unique conversation between same participants for same listing
ConversationSchema.index(
  { 
    participants: 1,
    listingId: 1
  },
  { 
    unique: true,
    partialFilterExpression: { isActive: true }
  }
);

// Index for querying user's conversations
ConversationSchema.index({ participants: 1, lastMessageAt: -1 });

const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);

export default Conversation;
