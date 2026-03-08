import mongoose from "mongoose";

const associatedUsers = {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    required: true,
    default: []
};

const customPlans = {
    lifetime: { type: Number, default: 0 },
    monthly: { type: Number, default: 0 }
};

const customModel = {
    username: { type: String, default: '' },
    displayName: { type: String, default: '' },
    description: { type: String, default: '' },
    profilePicture: { type: String, default: '' },
    coverPicture: { type: String, default: '' },
    instagramLink: { type: String, default: '' },
    sessions: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
};

const revenueSchema = new mongoose.Schema({
    balance: {
        type: Number,
        required: true,
        default: 0
    },
    sessions: {
        type: Number,
        default: 0
    },
    conversionRate: {
        type: Number,
        default: 0
    },
    transactions: [{
        type: mongoose.Schema.Types.Mixed,
        required: true,
        default: []
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    customPlans: customPlans,
    customModel: customModel,
    associatedUsers: associatedUsers
})

export default revenueSchema;