import mongoose from 'mongoose';
import subscriptionSchema from './subscriptionSchema.js';

const customerSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    subscription: {
        type: subscriptionSchema,
        required: false
    },
    closeFriendsAccess: {
        active: {
            type: Boolean,
            default: false
        },
        purchasedAt: {
            type: Date,
            required: false
        }
    },
}, {
    timestamps: true
});

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;