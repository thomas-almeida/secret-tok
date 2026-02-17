import mongoose from 'mongoose';
import subscriptionSchema from './subscriptionSchema.js';
import revenueSchema from './revenueSchema.js';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  phone: {
    type: Number,
    required: true,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  subscription: {
    type: subscriptionSchema,
    required: false
  },
  revenue: {
    type: revenueSchema,
    required: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;