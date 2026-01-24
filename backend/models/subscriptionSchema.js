import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  transactionDate: {
    type: Date,
    required: true,
    default: Date.now
  }
});

export default subscriptionSchema;