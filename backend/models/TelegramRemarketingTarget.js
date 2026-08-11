import mongoose from "mongoose";

// Um doc por (fluxo, contato) marcado como audiência de remarketing.
// 'selected'  -> admin marcou o contato, ainda não disparou
// 'queued'    -> admin apertou "Disparar", aguardando o worker enviar
// 'sending'   -> reivindicado por um worker (claim atômico via findOneAndUpdate),
//                evita que dois processos/ticks concorrentes mandem em duplicidade
// 'sent'      -> enviado com sucesso (runId aponta pro TelegramFlowRun criado)
// 'failed'    -> falhou o envio (ex: usuário bloqueou o bot), erro em `error`
const telegramRemarketingTargetSchema = new mongoose.Schema({
    flowId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TelegramFlow',
        required: true
    },
    chatId: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['selected', 'queued', 'sending', 'sent', 'failed'],
        default: 'selected'
    },
    runId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TelegramFlowRun'
    },
    error: {
        type: String
    },
    queuedAt: {
        type: Date
    },
    sentAt: {
        type: Date
    }
}, { timestamps: true })

telegramRemarketingTargetSchema.index({ flowId: 1, chatId: 1 }, { unique: true })
telegramRemarketingTargetSchema.index({ status: 1 })

const TelegramRemarketingTarget = mongoose.model('TelegramRemarketingTarget', telegramRemarketingTargetSchema)

export default TelegramRemarketingTarget
