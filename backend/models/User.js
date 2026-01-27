import mongoose from 'mongoose';
import subscriptionSchema from './subscriptionSchema.js';

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
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;