import mongoose, { Schema } from 'mongoose';

const ListingSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [100, 'Title cannot be longer than 100 characters'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [2000, 'Description cannot be longer than 2000 characters'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative'],
    max: [1000000, 'Price cannot exceed 1,000,000']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: {
      values: [
        "Electronics",
        "Computers",
        "Mobile Phones",
        "Furniture",
        "Home & Garden",
        "Clothing",
        "Fashion",
        "Books",
        "Sports",
        "Automotive",
        "Real Estate",
        "Jobs",
        "Services",
        "Other"
      ],
      message: '{VALUE} is not a valid category'
    }
  },
  subcategory: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Please provide a location'],
    trim: true
  },
  condition: {
    type: String,
    required: [true, 'Please provide the condition'],
    enum: {
      values: ["New", "Like New", "Good", "Fair", "Poor"],
      message: '{VALUE} is not a valid condition'
    }
  },
  images: {
    type: [String],
    validate: {
      validator: function(v: string[]) {
        return v.length <= 10;
      },
      message: 'Cannot upload more than 10 images'
    },
    default: []
  },
  tags: {
    type: [String],
    validate: {
      validator: function(v: string[]) {
        return v.length <= 5;
      },
      message: 'Cannot add more than 5 tags'
    },
    default: []
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'sold', 'deleted'],
    default: 'draft'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  views: {
    total: {
      type: Number,
      default: 0
    },
    unique: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      lastViewed: {
        type: Date,
        default: Date.now
      },
      viewCount: {
        type: Number,
        default: 1
      }
    }]
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  promoted: {
    isPromoted: {
      type: Boolean,
      default: false
    },
    startDate: Date,
    endDate: Date,
    plan: {
      type: String,
      enum: ['basic', 'premium', 'featured']
    }
  },
  metadata: {
    lastStatusUpdate: Date,
    lastPriceUpdate: Date,
    originalPrice: Number,
    priceHistory: [{
      price: Number,
      date: {
        type: Date,
        default: Date.now
      }
    }]
  },
  shipping: {
    available: {
      type: Boolean,
      default: false
    },
    cost: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  negotiable: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
ListingSchema.index({ title: 'text', description: 'text', tags: 'text' });
ListingSchema.index({ location: '2dsphere' });
ListingSchema.index({ category: 1, subcategory: 1 });
ListingSchema.index({ userId: 1, createdAt: -1 });
ListingSchema.index({ status: 1, isDeleted: 1 });

// Soft delete method
ListingSchema.methods.softDelete = async function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  this.status = 'deleted';
  return this.save();
};

// Method to restore deleted listing
ListingSchema.methods.restore = async function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  this.status = 'inactive';
  return this.save();
};

// Method to add view
ListingSchema.methods.addView = async function(userId) {
  this.views.total += 1;
  
  const userView = this.views.unique.find(view => 
    view.userId.toString() === userId.toString()
  );

  if (userView) {
    userView.viewCount += 1;
    userView.lastViewed = new Date();
  } else {
    this.views.unique.push({ userId });
  }

  return this.save();
};

// Method to toggle save
ListingSchema.methods.toggleSave = async function(userId) {
  const userIndex = this.savedBy.indexOf(userId);
  
  if (userIndex === -1) {
    this.savedBy.push(userId);
  } else {
    this.savedBy.splice(userIndex, 1);
  }

  return this.save();
};

// Method to update price with history
ListingSchema.methods.updatePrice = async function(newPrice) {
  if (!this.metadata.originalPrice) {
    this.metadata.originalPrice = this.price;
  }

  this.metadata.priceHistory.push({
    price: this.price,
    date: new Date()
  });

  this.price = newPrice;
  this.metadata.lastPriceUpdate = new Date();

  return this.save();
};

// Pre-save middleware
ListingSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.metadata.lastStatusUpdate = new Date();
  }
  next();
});

// Virtual for formatted price
ListingSchema.virtual('formattedPrice').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(this.price);
});

// Virtual for time since posted
ListingSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - this.createdAt.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }

  return 'Just now';
});

// Method to check if listing is expired (for promotions)
ListingSchema.methods.isExpired = function() {
  if (!this.promotionExpiry) return false;
  return new Date() > this.promotionExpiry;
};

const Listing = mongoose.models.Listing || mongoose.model('Listing', ListingSchema);

export default Listing;
