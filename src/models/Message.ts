import mongoose, { Schema } from 'mongoose';

const MessageSchema = new Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [2000, 'Message cannot be longer than 2000 characters']
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'file'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    name: String,
    size: Number
  }],
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  metadata: {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing'
    },
    offerAmount: Number,
    offerStatus: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired']
    }
  }
}, {
  timestamps: true
});

// Index for querying messages in a conversation
MessageSchema.index({ conversationId: 1, createdAt: -1 });

// Update conversation's lastMessage on new message
MessageSchema.post('save', async function() {
  const Conversation = mongoose.model('Conversation');
  await Conversation.findByIdAndUpdate(this.conversationId, {
    lastMessage: this._id,
    lastMessageAt: this.createdAt
  });
});

const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

export default Message;
