import mongoose from "mongoose";

const telegramButtonSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true
    },
    kind: {
        type: String,
        enum: ['url', 'quiz'],
        required: true
    },
    url: {
        type: String,
        required: function () {
            return this.kind === 'url'
        }
    },
    // Se preenchido (só faz sentido em botões "quiz"), clicar aqui pula o fluxo
    // pra esse passo (order) em vez de seguir a ordem sequencial normal.
    goToStep: {
        type: Number
    }
}, { _id: false })

export default telegramButtonSchema
