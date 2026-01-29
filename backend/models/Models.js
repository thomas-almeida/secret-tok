import mongoose from "mongoose";
import videoDataSchema from './videoDataSchema.js'

const modelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    profilePic: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    videos: {
        type: [videoDataSchema],
        default: []
    }
})

const Models = mongoose.model('Models', modelSchema)

export default Models