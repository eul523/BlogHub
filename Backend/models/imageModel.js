import mongoose from "mongoose";

const imageSchema = mongoose.Schema({
    data:{
        type:Buffer,
        required:true
    },
    contentType:{
        type:String,
        required:true
    },
    fileName:String
})

export default mongoose.model("Image", imageSchema);