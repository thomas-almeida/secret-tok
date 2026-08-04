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
    },
    // Se true (e o passo tiver ao menos um botão "quiz"), o envio pausa aqui
    // até alguém clicar num botão quiz ou o timeout abaixo expirar.
    waitForClick: {
        type: Boolean,
        default: false
    },
    timeoutSeconds: {
        type: Number
    },
    // Pra onde pular se ninguém clicar dentro do timeout (default: próximo passo)
    timeoutGoToStep: {
        type: Number
    }
})

export default telegramStepSchema
