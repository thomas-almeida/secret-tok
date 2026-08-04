import mongoose from "mongoose";
import telegramStepSchema from './telegramStepSchema.js'

const telegramFlowSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    active: {
        type: Boolean,
        default: true
    },
    steps: {
        type: [telegramStepSchema],
        default: []
    }
}, { timestamps: true })

const TelegramFlow = mongoose.model('TelegramFlow', telegramFlowSchema)

export default TelegramFlow
