import mongoose from "mongoose";
import telegramButtonSchema from './telegramButtonSchema.js'

const telegramStepSchema = new mongoose.Schema({
    order: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'photo', 'video'],
        required: true
    },
    text: {
        type: String
    },
    mediaUrl: {
        type: String,
        required: function () {
            return this.type === 'photo' || this.type === 'video'
        }
    },
    delaySeconds: {
        type: Number,
        default: 0
    },
    buttons: {
        type: [telegramButtonSchema],
        default: []
    }
})

export default telegramStepSchema
