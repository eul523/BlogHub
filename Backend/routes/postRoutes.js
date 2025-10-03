import {
  Router
} from "express";
import Post, {
  Comment
} from "../models/postModel.js";
import {
  getPosts,
  getPostBySlug,
  getComments,
  getUserPosts
} from "../utils.js";
import asyncHandler from "express-async-handler";
import slugify from "slugify";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import {
  protectRoute,
  protectRouteLoose
} from "../middlewares/authMiddleware.js";
import upload from "../multerConfig.js";
import Image from "../models/imageModel.js";
import sanitizeHtml from "sanitize-html";

function cleanBody(html) {
  const clean = sanitizeHtml(html, {
    allowedTags: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'br',
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target'],
      img: ['src', 'alt'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  });
  return clean;
}




const router = Router();

/**
 * Helpers
 */

function parsePublished(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value === 'true' || value === '1';
  }
  return false;
}

function parseTags(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    // try JSON array first
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map(String).map(s => s.trim()).filter(Boolean);
    } catch (_) {
      // not JSON — fall back to comma separated
    }
    return trimmed.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}


router.get("/me", protectRoute, asyncHandler(async (req, res) => {
  try {
    let posts = await getUserPosts(req.user.username, parseInt(req.query.page) || 1, parseInt(req.query.limit) || 20);
    posts.posts = posts.posts.map(p => {
      let pObj = p.toObject();
      pObj.liked = Array.isArray(pObj.likes) && pObj.likes.some(l => String(l) === String(req.user._id));
      pObj.isFavourite = req.user.favourite_posts.some(p => String(p._id === String(pObj._id)))
      delete pObj.likes;
      pObj.isOwner = String(req.user._id) === String(pObj.author._id);
      return pObj;
    })
    return res.status(200).json(posts);
  } catch (err) {
    if (err.message === 'Invalid user ID.' || err.message === 'User not found.') {
      return res.status(400).json({
        msg: err.message
      });
    }
    return res.status(500).json({
      msg: 'Failed to fetch posts.',
      error: err.message
    });
  }

}))

router.get("/favourites", protectRoute, asyncHandler(async (req, res) => {
  const user = await req.user.populate({
    path: "favourite_posts",
    select: "-comments",
    populate: {
      path: "author",
      select: "name username profileImage"
    }
  });


  const favouritePosts = user.favourite_posts.map(p => {
    let pp = p.toObject();
    pp.liked = p.likes.some(i => String(i) === String(req.user._id))
    delete pp.likes;
    pp.isFavourite = true;
    return pp;
  });

  res.json({
    favouritePosts
  });

}))

router.get("/", protectRouteLoose, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  try {
    const data = await getPosts(page, limit);

    data.posts = data.posts.map(p => {
      const n = p.toObject();
      if (req.user) {
        n.liked = Array.isArray(p.likes) && p.likes.some(l => String(l) === String(req.user._id));
        n.isFavourite = req.user.favourite_posts.some(p => String(p._id === String(n._id)));
        n.isOwner = String(req.user._id) === String(n.author._id);
      }
      delete n.likes;
      n.commentsLen = n.comments.length;
      delete n.comments;
      return n;
    });

    res.status(200).json(data);
  } catch (err) {
    return res.status(err.status || 500).json({
      msg: "Internal server error"
    });
  }
}));

router.get("/:slug", protectRouteLoose, asyncHandler(async (req, res) => {
  if (!/^[a-zA-Z0-9-]+$/.test(req.params.slug)) {
    return res.status(400).json({
      msg: 'Invalid slug format'
    });
  }
  try {
    const data = await getPostBySlug(req.params.slug);
    if (!data) return res.status(404).json({
      msg: "Post not found."
    });
    const post = data.toObject();
    delete post.likes;
    if (req.user) {
      post.liked = Array.isArray(data.likes) && data.likes.some(l => String(l) === String(req.user._id));
      post.isFavourite = req.user.favourite_posts.some(p => String(p._id === String(post._id)))
      post.isOwner = String(req.user._id) === String(post.author._id);
    }
    res.status(200).json(post);
  } catch (err) {
    return res.status(err.status || 500).json({
      msg: "Internal server error"
    });
  }
}));

router.delete("/:slug", protectRoute, asyncHandler(async (req, res) => {
  if (!/^[a-zA-Z0-9-]+$/.test(req.params.slug)) {
    return res.status(400).json({
      msg: 'Invalid slug format.'
    });
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const post = await Post.findOneAndDelete({
      slug: req.params.slug,
      author: req.user._id
    }, {
      session
    });

    if (!post) {
      await session.abortTransaction();
      return res.status(404).json({
        msg: "Post not found or you are not authorized to delete it."
      });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $pull: {
        posts: post._id
      }
    }, {
      new: true,
      session
    });
    await Comment.deleteMany({
      post: post._id
    }, {
      session
    });

    if (post.images && post.images.length > 0) {
      const imageUrls = post.images.map(i => i.slice(8));
      for (const imageUrl of imageUrls) {
        await Image.findByIdAndDelete(imageUrl, {
          session
        })
      }
    }

    await session.commitTransaction();
    return res.status(200).json({
      msg: "Post deleted successfully."
    });
  } catch (err) {
    await session.abortTransaction();
    console.error('Delete post error:', err);
    return res.status(500).json({
      msg: err.message || 'Failed to delete post.'
    });
  } finally {
    session.endSession();
  }
}));

router.put("/:slug", protectRoute, asyncHandler(async (req, res) => {
  if (!/^[a-zA-Z0-9-]+$/.test(req.params.slug)) {
    return res.status(400).json({
      msg: 'Invalid slug format.'
    });
  }
  try {
    const post = await Post.findOne({
      slug: req.params.slug,
      author: req.user._id
    });
    if (!post) return res.status(404).json({
      msg: "Post not found or you are not authorized to edit it."
    });

    const {
      title,
      body,
      tags,
      published,
      removeImages
    } = req.body;

    if (title) {
      post.title = title;
    }
    if (body) post.body = body;
    if (tags) post.tags = parseTags(tags);

    if (published !== undefined) post.published = parsePublished(published);

    if (removeImages && Array.isArray(removeImages) && removeImages.length > 0) {
      for (const imageUrl of removeImages) {
        if (post.images.includes(imageUrl)) {
          const deleted = await findByIdAndDelete(imageUrl.slice(8));
          if (deleted) post.images.pull(imageUrl);
        }
      }
    }

    await post.save();
    return res.json({
      post,
      msg: "Updated successfully."
    });
  } catch (err) {
    console.error('Update post error:', err);
    res.status(500).json({
      msg: err.message || 'Failed to update post.'
    });
  }
}));

router.post('/', protectRoute, upload.array('images', 5), asyncHandler(async (req, res) => {
  const {
    title,
    body
  } = req.body;
  let {
    tags,
    published
  } = req.body;
  const authorId = req.user._id;

  if (!title || !body) {
    return res.status(400).json({
      msg: 'Title and body are required.'
    });
  }
  const parsedTags = parseTags(tags);
  const isPublished = parsePublished(published);


  const session = await mongoose.startSession();
  let savedImages = [];
  try {
    session.startTransaction();
    if (req.files && req.files.length) {
      for (let file of req.files) {
        const newImage = new Image({
          data: file.buffer,
          contentType: file.mimetype,
          fileName: file.originalname

        })
        await newImage.save({
          session
        })
        savedImages.push(newImage)
      }
    }
    const baseSlug = slugify(title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
    let slug = baseSlug;
    let counter = 1;
    while (await Post.findOne({
        slug
      })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const imageUrls = savedImages.map(i => `/images/${i._id}`);
    const newPost = new Post({
      title,
      body: cleanBody(body),
      tags: parsedTags,
      slug,
      published: isPublished,
      author: authorId,
      images: imageUrls,
    });

    await newPost.save({
      session
    });
    await User.findByIdAndUpdate(authorId, {
      $push: {
        posts: newPost._id
      }
    }, {
      new: true,
      session
    });

    await session.commitTransaction();

    const resp = newPost.toObject();
    delete resp.likes;
    delete resp.comments;
    resp.author = {
      username: req.user.username,
      name: req.user.name,
      profileImage: req.user.profileImage
    };

    return res.status(201).json(resp);
  } catch (err) {
    await session.abortTransaction();
    console.error('Create post error after upload — rolling back, deleting uploaded images:', err);

    await Promise.all(savedImages.map(i => Image.findByIdAndDelete(i._id).catch(e => {})));

    return res.status(500).json({
      msg: 'Failed to create post.',
      error: err.message || String(err)
    });
  } finally {
    session.endSession();
  }
}));


router.post("/:slug/like", protectRoute, asyncHandler(async (req, res) => {
  if (!/^[a-zA-Z0-9-]+$/.test(req.params.slug)) {
    return res.status(400).json({
      msg: 'Invalid slug format.'
    });
  }
  const post = await Post.findOne({
    slug: req.params.slug
  }).select("-comments");
  if (!post) return res.status(404).json({
    msg: "Post not found."
  });


  if (post.likes.some(l => String(l) === String(req.user._id))) return res.status(409).json({
    msg: "You already like this post."
  });
  try {
    post.likes.push(req.user._id);
    await post.save();
    return res.json({
      msg: "Liked the post successfully.",
      likesCount: post.likes.length
    });
  } catch (err) {
    console.error('Like error:', err);
    return res.status(500).json({
      msg: "Error occurred."
    });
  }
}));

router.delete("/:slug/like", protectRoute, asyncHandler(async (req, res) => {
  if (!/^[a-zA-Z0-9-]+$/.test(req.params.slug)) {
    return res.status(400).json({
      msg: 'Invalid slug format.'
    });
  }
  const post = await Post.findOne({
    slug: req.params.slug
  }).select("-comments");
  if (!post) return res.status(404).json({
    msg: "Post not found."
  });

  if (!post.likes.some(l => String(l) === String(req.user._id))) return res.status(409).json({
    msg: "Couldn't unlike this post."
  });
  try {
    post.likes = post.likes.filter(l => String(l) !== String(req.user._id));
    await post.save();
    return res.json({
      msg: "Unliked the post successfully.",
      likesCount: post.likes.length
    });
  } catch (err) {
    console.error('Unlike error:', err);
    return res.status(500).json({
      msg: "Error occurred."
    });
  }
}));


router.post("/:slug/favourite", protectRoute, asyncHandler(async (req, res) => {
  if (!/^[a-zA-Z0-9-]+$/.test(req.params.slug)) {
    return res.status(400).json({
      msg: 'Invalid slug format.'
    });
  }
  const post = await Post.findOne({
    slug: req.params.slug
  }).select("title");
  if (!post) return res.status(404).json({
    msg: "Post not found."
  });

  if (req.user.favourite_posts.some(i => String(i) === String(post._id))) {
    return res.status(409).json({
      msg: "Already in favourites."
    })
  }
  req.user.favourite_posts.push(post._id);
  try {
    await req.user.save();
    return res.json({
      msg: "Post added to favourites."
    })
  } catch (err) {
    res.status(500).json({
      msg: "Internal server error"
    });
  }
}))

router.delete("/:slug/favourite", protectRoute, asyncHandler(async (req, res) => {
  if (!/^[a-zA-Z0-9-]+$/.test(req.params.slug)) {
    return res.status(400).json({
      msg: 'Invalid slug format.'
    });
  }
  const post = await Post.findOne({
    slug: req.params.slug
  }).select("title");
  if (!post) return res.status(404).json({
    msg: "Post not found."
  });

  if (!req.user.favourite_posts.some(i => String(i) === String(post._id))) {
    return res.status(409).json({
      msg: "Not favourite."
    })
  }
  req.user.favourite_posts.pull(post._id);

  try {
    await req.user.save();
    res.json({
      msg: "Post removed from favourites."
    });
  } catch (err) {
    res.status(500).json({
      msg: "Internal server error"
    });
  }

  try {
    await req.user.save();
    return res.json({
      msg: "Post removed from favourites."
    })
  } catch (err) {
    res.status(500).json({
      msg: "Internal server error"
    });
  }
}))

// comments crud

router.get("/:slug/comments", asyncHandler(async (req, res) => {
  if (!/^[a-zA-Z0-9-]+$/.test(req.params.slug)) {
    return res.status(400).json({
      msg: 'Invalid slug format.'
    });
  }
  const {
    page,
    limit
  } = req.query;
  try {
    const comments = await getComments(req.params.slug, parseInt(limit), parseInt(page));
    return res.json(comments);
  } catch (err) {
    return res.status(err.status || 500).json({
      msg: err.message
    });
  }
}));

router.post('/:slug/comments', protectRoute, asyncHandler(async (req, res) => {
  const {
    slug
  } = req.params;
  if (!/^[a-zA-Z0-9-]+$/.test(slug)) {
    return res.status(400).json({
      msg: 'Invalid slug format.'
    });
  }
  const {
    content
  } = req.body;
  if (!content || typeof content !== 'string' || content.trim().length < 1) {
    return res.status(400).json({
      msg: 'Comment content is required and must be a non-empty string.'
    });
  }
  if (content.length > 5000) {
    return res.status(400).json({
      msg: 'Comment cannot exceed 5000 characters.'
    });
  }
  const post = await Post.findOne({
    slug
  });
  if (!post) {
    return res.status(404).json({
      msg: 'Post not found.'
    });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const comment = new Comment({
      content: content.trim(),
      author: req.user._id,
      post: post._id,
      replies: [],
    });
    await comment.save({
      session
    });
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name username profileImage')
      .session(session);
    post.comments.push(populatedComment._id);
    await post.save({
      session
    });
    await session.commitTransaction();
    return res.status(201).json({
      msg: 'Comment added.',
      comment: populatedComment
    });
  } catch (err) {
    await session.abortTransaction();
    console.error('Create comment error:', err);
    return res.status(500).json({
      msg: "Couldn't create comment."
    });
  } finally {
    session.endSession();
  }
}));

router.get('/:slug/comments/:commentId/replies', protectRouteLoose, asyncHandler(async (req, res) => {
  const {
    slug,
    commentId
  } = req.params;
  if (!/^[a-zA-Z0-9-]+$/.test(slug)) {
    return res.status(400).json({
      msg: 'Invalid slug format.'
    });
  }
  if (!mongoose.isValidObjectId(commentId)) {
    return res.status(400).json({
      msg: 'Invalid comment ID.'
    });
  }
  const post = await Post.findOne({
    slug
  });
  if (!post) {
    return res.status(404).json({
      msg: 'Post not found.'
    });
  }
  const comment = await Comment.findOne({
    _id: commentId,
    post: post._id
  }).populate({
    path: "replies.author",
    select: "username name profileImage"
  });
  if (!comment) {
    return res.status(404).json({
      msg: 'Comment not found or not associated with this post.'
    });
  }
  if (comment.replies.length === 0) return res.json({
    msg: "No replies for this comments."
  });
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const totalPages = Math.ceil(comment.replies.length / limit);

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const replies = comment.replies.slice(startIndex, endIndex);
  return res.json({
    replies,
    currentPage: page,
    totalPages
  })

}));

router.post('/:slug/comments/:commentId/replies', protectRoute, asyncHandler(async (req, res) => {
  const {
    slug,
    commentId
  } = req.params;
  if (!/^[a-zA-Z0-9-]+$/.test(slug)) {
    return res.status(400).json({
      msg: 'Invalid slug format.'
    });
  }
  if (!mongoose.isValidObjectId(commentId)) {
    return res.status(400).json({
      msg: 'Invalid comment ID.'
    });
  }
  const {
    content,
    to
  } = req.body;
  if (!content || typeof content !== 'string' || content.trim().length < 1) {
    return res.status(400).json({
      msg: 'Reply content is required and must be a non-empty string.'
    });
  }
  if (content.length > 3000) {
    return res.status(400).json({
      msg: 'Reply cannot exceed 3000 characters.'
    });
  }

  const post = await Post.findOne({
    slug
  });
  if (!post) {
    return res.status(404).json({
      msg: 'Post not found.'
    });
  }
  const comment = await Comment.findOne({
    _id: commentId,
    post: post._id
  });
  if (!comment) {
    return res.status(404).json({
      msg: 'Comment not found or not associated with this post.'
    });
  }

  const reply = {
    content: content.trim(),
    author: req.user._id,
    createdAt: new Date(),
    to: to || ""
  };
  comment.replies.push(reply);
  await comment.save();

  const newReply = {
    content: content.trim(),
    author: {
      profileImage: req.user.profileImage,
      username: req.user.username,
      name: req.user.name
    },
    likes: 0,
    to: to || ""
  };

  return res.status(201).json({
    msg: 'Reply added.',
    reply: newReply
  });
}));

export default router;