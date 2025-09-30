import mongoose from "mongoose";

const replySchema = mongoose.Schema({
    content:{
        type:String,
        required:true,
        trim:true,
        maxlength:3000
    },
    to:{
        type:String
    },
    author:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true
    },
    likes:{
        type: [{type:mongoose.Schema.ObjectId,ref:"User",}],
        default:[]
    },
    
    dateWritten:{
        type:Date,
        default:Date.now
    }
})

const commentSchema = mongoose.Schema({
    content:{
        type:String,
        required:true,
        maxlength:5000,
        trim:true
    },
    
    author:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true
    },
    post:{
        type:mongoose.Schema.ObjectId,
        ref:"Post",
        required:true
    },
    likes:{type:[{
        type:mongoose.Schema.ObjectId,
        ref:"User",
    }], default:[]},
    
    replies:{type:[{
        type: replySchema
    }],
        default:[]
    },
    
    dateWritten:{
        type:Date,
        default:Date.now
    }
})

commentSchema.index({ post: 1, createdAt: -1 });

const postsSchema = mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true,
        minlength:3,
        maxlength:100
    },
    body:{
        type:String,
        required:true,
        trim:true,
        minlength:[4, "The post's body should be atleast 4 character."],
        maxlength:[10000, "Maximum allowed post length is 10,000."]
    },
    images : {
        type:[String],
        default:[]
    },
    dateWritten:{
        type:Date,
        default: Date.now
    },
    author:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true
    },
    tags:{type:[{
        type:String,
        trim:true
    }],
    default:[]
},
    slug:{
        type:String,
        unique:true,
        required:true,
        trim:true 
    },
    published:{
        type:Boolean,
        default:true 
    },
    comments:{
        type:[{type:mongoose.Schema.ObjectId,ref:"Comment",}],
    default:[]
    },
    likes:{
        type: [{type:mongoose.Schema.ObjectId,ref:"User",}],
        default:[]
    },
    likes_count: {
    type:Number,
    default:0
  },
  comments_count: {
    type:Number,
    default:0
  },
    dateUpdated:{
        type:Date,
        default:Date.now
    }
})

postsSchema.index({title:"text", body:"text", tags:"text"});

postsSchema.pre('save', async function (next) {
  try {
    // Update dateUpdated
    this.dateUpdated = Date.now();
    
    next();
  } catch (err) {
    console.error('Error in pre-save middleware:', err);
    next(err);
  }
});

postsSchema.pre("save", async function(next){
  if (this.isModified('comments')){
    const count = this.comments.length;
    this.comments_count = count;
  }
  if (this.isModified('likes')){
    const count = this.likes.length;
    this.likes_count = count;
  }
  next();
})

const Comment = mongoose.model("Comment", commentSchema);
export default mongoose.model("Post", postsSchema);
export {Comment};