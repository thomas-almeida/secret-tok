import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  transactionDate: {
    type: Date,
    required: true,
    default: Date.now
  }
});

export default subscriptionSchema;