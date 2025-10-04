import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  username: {
    type: String,
    unique: true,
    minlength: 2,
    maxlength: 15
  },
  description: {
    type: String,
    maxlength: [100, "Description cannot exceed 500 characters"],
    minlength: [3, "Description must atleast be 3 characters"]
  },
  profileImage: {
    type: String,
    default: "/assets/default-profile.png"
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters long']
  },
  googleId: String,
  followers: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    default: []
  },

  following: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    default: []
  },
  favourite_posts: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }],
    default:[]
  },

  settings: {
    following_hidden: {
      type: Boolean,
      default: true
    }
  },
  followers_count: {
    type: Number,
    default: 0
  },
  following_count: {
    type: Number,
    default: 0
  },
  posts: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    }],
    default: []
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.index({posts:1})
userSchema.index({
  name: "text",
  username: "text",
  description:"text"
});


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.pre("save", async function (next) {
  if (this.isModified('followers')) {
    const count = this.followers.length;
    this.followers_count = count;
  }
  if (this.isModified('following')) {
    const count = this.following.length;
    this.following_count = count;
  }
  next();
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);