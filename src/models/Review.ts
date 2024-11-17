import mongoose, { Schema } from 'mongoose';

const ReviewSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  title: {
    type: String,
    required: [true, 'Please provide a review title'],
    trim: true,
    maxlength: [100, 'Title cannot be longer than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide review content'],
    trim: true,
    maxlength: [1000, 'Review cannot be longer than 1000 characters']
  },
  images: {
    type: [String],
    validate: {
      validator: function(v: string[]) {
        return v.length <= 5;
      },
      message: 'Cannot upload more than 5 images'
    }
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpfulVotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reportCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Ensure one review per user per listing
ReviewSchema.index({ userId: 1, listingId: 1 }, { unique: true });

// Update listing rating on review changes
ReviewSchema.post('save', async function() {
  const Listing = mongoose.model('Listing');
  const listingId = this.listingId;
  
  const stats = await this.constructor.aggregate([
    { $match: { listingId: listingId } },
    {
      $group: {
        _id: '$listingId',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  await Listing.findByIdAndUpdate(listingId, {
    rating: stats[0]?.avgRating || 0,
    numReviews: stats[0]?.numReviews || 0
  });
});

const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

export default Review;
