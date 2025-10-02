
import Post from './models/postModel.js';
import User from './models/userModel.js';
import mongoose from "mongoose";
import axios from "axios";
import { Comment } from './models/postModel.js';

const throwError = (errStr="Bad request", errCode=400) => {
  let err = new Error(errStr);
  err.status = errCode;
  throw err;
}

async function getPosts(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  try {
    const posts = await Post.find({published:true})
      .skip(skip)
      .limit(limit)
      .populate('author', 'name username profileImage')
      .sort({ createdAt: -1 }); 

    const totalPosts = await Post.countDocuments();
    return {
      posts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page
    };
  } catch (error) {
    throw new Error('Error fetching posts: ' + error.message);
  }
}

async function getPostBySlug(slug) {
  try {
    const post = await Post.findOne({ "slug":slug, published:true }).select("-comments").populate('author', 'name username profileImage');
    if(!post){
        throw new Error('Post not found');
    }
    return post;
  } catch (error) {
    throw new Error('Error fetching post: ' + error.message);
  }
}

async function getUserPosts(username , limit=20, page=1){
  const user = await User.findOne({username:username}).populate({
    path:"posts",
    match:{published:true},
    select:"-comments",
    options:{
      skip:(page-1) * limit,
      limit:limit,
      sort: {dateWritten: -1}
    },
    populate:{
     path:"author",
     select:"name profileImage username" 
    }
  });
  if(!user)throw new Error("No user found.");
  const totalPosts = await Post.countDocuments({author:user._id, published: true});
  return {
      posts:user.posts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page
    };
}

async function getComments(slug, limit=20, page=1) {
  const post = await Post.findOne({slug:slug});
  if(!post)throwError("No post found.", 404);
  let comments = await Comment.aggregate([
    { $match : {post:post._id}},
    { $addFields : { likeLen : { $size : "$likes"}, repliesLen : { $size : "$replies"} }},
    {$sort:{likeLen:-1, dateWritten:-1}},
    { $skip : (page - 1) * limit },
    { $limit : limit},
    { $project : { replies : 0}}
  ]);
  comments = await Comment.populate(comments, { path:"author", select:"name username profileImage"});
  const totalComs = await Comment.countDocuments({post:post._id});
  return {
      comments,
      totalPages: Math.ceil(totalComs / limit),
      currentPage: page
    };
}

async function fetchProfileImage(imageUrl, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      return { data: Buffer.from(response.data), contentType: response.headers["content-type"] };
    } catch (err) {
      if (err.response?.status === 429 && i < retries - 1) {
        console.warn(`429 Too Many Requests, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        continue;
      }
      console.error("Failed to fetch profile image:", err.message);
      return null;
    }
  }
  return null;
}


const connectDB = async (uri) => {
  mongoose.connection.on("connected", () => console.log("connected to db."));
  mongoose.connection.on("disconnected", () => console.log("db disconnected."));
  
  let mongoconnected = 3;
  while(mongoconnected>0){
    try{
      console.log("connecting to db");
      await mongoose.connect(uri);
      break;
    }catch(err){
      mongoconnected--;
      console.log(err);
    }
      
  }
  


  
}
export { getPosts, getPostBySlug,  connectDB, getUserPosts, getComments, fetchProfileImage };