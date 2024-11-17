import mongoose from 'mongoose';
import { Schema, model, models } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  name: string;
  email: string;
  password?: string;
  image?: string;
  thumbnailImage?: string;
  emailVerified?: Date;
  bio?: string;
  location?: string;
  website?: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  accounts?: any[];
  sessions?: any[];
  savedListings?: mongoose.Types.ObjectId[];
  activityHistory?: Array<{
    action: 'create' | 'edit' | 'delete' | 'view' | 'save' | 'message';
    targetType: 'listing' | 'message' | 'profile';
    targetId: mongoose.Types.ObjectId;
    metadata?: any;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minLength: [2, 'Name must be at least 2 characters long'],
    maxLength: [50, 'Name cannot be more than 50 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  image: {
    type: String,
    default: ''
  },
  thumbnailImage: {
    type: String,
    default: ''
  },
  emailVerified: Date,
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  location: {
    type: String,
    maxlength: [100, 'Location cannot be more than 100 characters']
  },
  website: {
    type: String,
    match: [
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
      'Please provide a valid URL'
    ]
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  pushNotifications: {
    type: Boolean,
    default: false
  },
  accounts: [{
    type: Schema.Types.ObjectId,
    ref: 'Account'
  }],
  sessions: [{
    type: Schema.Types.ObjectId,
    ref: 'Session'
  }],
  savedListings: [{
    type: Schema.Types.ObjectId,
    ref: 'Listing'
  }],
  activityHistory: {
    type: [{
      action: {
        type: String,
        enum: ['create', 'edit', 'delete', 'view', 'save', 'message'],
        required: true
      },
      targetType: {
        type: String,
        enum: ['listing', 'message', 'profile'],
        required: true
      },
      targetId: {
        type: Schema.Types.ObjectId,
        required: true
      },
      metadata: Schema.Types.Mixed,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    select: false
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Create indexes
UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ 'activityHistory.timestamp': -1 });

const User = models.User || model('User', UserSchema);

export default User;
