import mongoose from "mongoose";

const notifSchema = mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    read:{
        type:Boolean,
        default:false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    additionalInfo: {
        type: mongoose.Schema.Types.Mixed,
        required:false
    }
})

const Notification = new mongoose.model("Notification", notifSchema);

export default Notification;