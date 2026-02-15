import mongoose from 'mongoose';

const webhookEventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  eventType: {
    type: String,
    required: true,
    enum: ['billing.paid', 'withdraw.done', 'withdraw.failed']
  },
  gatewayId: {
    type: String,
    index: true
  },
  processedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'failed'],
    default: 'processed'
  }
});

const WebhookEvent = mongoose.model('WebhookEvent', webhookEventSchema);

export default WebhookEvent;
