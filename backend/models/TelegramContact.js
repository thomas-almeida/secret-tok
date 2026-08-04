import mongoose from "mongoose";

const telegramContactSchema = new mongoose.Schema({
    chatId: {
        type: Number,
        required: true,
        unique: true
    },
    username: {
        type: String
    },
    firstName: {
        type: String
    }
}, { timestamps: true })

const TelegramContact = mongoose.model('TelegramContact', telegramContactSchema)

export default TelegramContact
