import mongoose from "mongoose";

const associatedUsers = {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    required: true,
    default: []
};

const revenueSchema = new mongoose.Schema({
    balance: {
        type: Number,
        required: true,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    associatedUsers: associatedUsers
})

export default revenueSchema;