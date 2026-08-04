import mongoose from "mongoose";

const buttonClickSchema = new mongoose.Schema({
    stepOrder: {
        type: Number,
        required: true
    },
    buttonLabel: {
        type: String,
        required: true
    },
    buttonKind: {
        type: String,
        enum: ['url', 'quiz'],
        required: true
    },
    clickedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false })

const telegramFlowRunSchema = new mongoose.Schema({
    flowId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TelegramFlow',
        required: true
    },
    flowSlug: {
        type: String,
        required: true
    },
    chatId: {
        type: Number,
        required: true
    },
    username: {
        type: String
    },
    firstName: {
        type: String
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    maxStepOrderReached: {
        type: Number,
        default: 0
    },
    completedAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['in_progress', 'completed'],
        default: 'in_progress'
    },
    buttonClicks: {
        type: [buttonClickSchema],
        default: []
    }
}, { timestamps: true })

telegramFlowRunSchema.index({ flowId: 1, status: 1 })
telegramFlowRunSchema.index({ flowId: 1, maxStepOrderReached: 1 })

const TelegramFlowRun = mongoose.model('TelegramFlowRun', telegramFlowRunSchema)

export default TelegramFlowRun
