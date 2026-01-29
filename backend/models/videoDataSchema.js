import mongoose from "mongoose";

const videoDataSchema = new mongoose.Schema({
    videoUrl: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
})

export default videoDataSchema