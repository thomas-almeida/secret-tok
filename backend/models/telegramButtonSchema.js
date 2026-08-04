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
    }
}, { _id: false })

export default telegramButtonSchema
