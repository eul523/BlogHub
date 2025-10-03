import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Image from "../models/imageModel.js";
import {
  protectRoute,
  protectRouteLoose
} from '../middlewares/authMiddleware.js';
import {
  getUserPosts
} from '../utils.js';
import mongoose from 'mongoose';
import upload from '../multerConfig.js';
import dotenv from "dotenv";
import Post from "../models/postModel.js";

const router = express.Router();
dotenv.config();

// Upload profile image route
router.post('/profile-image', protectRoute, upload.single('profileImage'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      msg: 'No image uploaded.'
    });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const image = new Image({
      data: req.file.buffer,
      contentType: req.file.mimetype,
      fileName: req.file.originalname
    })
    await image.save({
      session
    });

    if(req.user.profileImage !== "/assets/default-profile.png"){
      await Image.findByIdAndDelete(String(req.user.profileImage).slice(0,9)[1],{session});
    }

    const user = await User.findByIdAndUpdate(
      req.user._id, {
        profileImage: `/images/${image._id}`
      }, {
        new: true,
        session
      }
    );
    if (!user) {
      await session.abortTransaction();
      return res.status(400).json({
        msg: "No user found."
      })
    }
    await session.commitTransaction();
    return res.status(200).json({
      msg: 'Profile image updated.',
      profileImage: user.profileImage
    });
  } catch (err) {
    await session.abortTransaction();
    return res.status(500).json({
      msg: "Profile update failed."
    })
  } finally {
    session.endSession();
  }


}));

router.delete(
  '/profile-image',
  protectRoute,
  asyncHandler(async (req, res) => {
    const user = req.user;
    if (user.profileImage === "/assets/default-profile.png") {
      return res.status(400).json({
        msg: 'No profile image to delete.'
      });
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      await Image.findByIdAndDelete(user.profileImage.slice(8), {
        session
      });
      user.profileImage = "/assets/default-profile.png";
      await user.save({
        session
      });
      await session.commitTransaction();
      return res.status(200).json({
        msg: 'Profile image deleted.',
        profileImage: user.profileImage
      });
    } catch (err) {
      await session.abortTransaction();
      return res.status(500).json({
        msg: 'Profile image deletion unsuccessful.'
      })
    } finally {
      session.endSession();
    }
  })
);

router.get("/:username", protectRouteLoose, asyncHandler(async (req, res) => {
  let user = await User.findOne({
    username: req.params.username
  }).select("-comments -email -password -googleId -followers -following -favourite_posts -settings -posts");
  if (!user) {
    return res.status(404).json({
      msg: "No user found."
    });
  }
  user = user.toObject();
  if (req.user && req.user._id !== user._id && req.user.following.includes(user._id)) user.isFollowing = true;

  return res.json(user)
}))

router.get("/:username/posts", protectRouteLoose, asyncHandler(async (req, res) => {
  try {
    const posts = await getUserPosts(req.params.username, parseInt(req.query.page) || 1, parseInt(req.query.limit) || 10);
    posts.posts = posts.posts.map(p => {
      const n = p.toObject();
      if (req.user) {
        n.liked = Array.isArray(p.likes) && p.likes.some(l => String(l) === String(req.user._id));
        n.isFavourite = req.user.favourite_posts.some(p=>String(p._id===String(n._id)))
        n.isOwner = String(req.user._id) === String(n.author._id);
      }
      delete n.likes;
      return n;
    });
    return res.json(posts);
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

router.post("/:username/follow", protectRoute, asyncHandler(async (req, res) => {
  const {
    username
  } = req.params;

  if (username === req.user.username) {
    return res.status(400).json({
      msg: 'Cannot follow yourself.'
    });
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const targetUser = await User.findOne({
      username: username
    }).session(session);
    if (!targetUser) {
      await session.abortTransaction();
      return res.status(404).json({
        msg: 'User not found.'
      });
    }
    const currentUser = await User.findById(req.user._id).session(session);
    if (currentUser.following.includes(targetUser._id)) {
      await session.abortTransaction();
      return res.status(400).json({
        msg: 'Already following this user.'
      });
    }
    await User.findByIdAndUpdate(
      req.user._id, {
        $push: {
          following: targetUser._id
        },
        $inc: {
          following_count: 1
        }
      }, {
        new: true,
        session
      }
    );
    await User.findByIdAndUpdate(
      targetUser._id, {
        $push: {
          followers: req.user._id
        },
        $inc: {
          followers_count: 1
        }
      }, {
        new: true,
        session
      }
    );
    await session.commitTransaction();
    return res.status(200).json({
      msg: 'Followed user successfully.'
    });
  } catch (err) {
    await session.abortTransaction();
    console.error('Follow user error:', err);
    return res.status(500).json({
      msg: 'Failed to follow user.',
      error: err.message
    });
  } finally {
    session.endSession();
  }
}))

router.delete(
  '/:username/follow',
  protectRoute,
  asyncHandler(async (req, res) => {
    const {
      username
    } = req.params;

    if (username === req.user.username) {
      return res.status(400).json({
        msg: 'Cannot unfollow yourself.'
      });
    }
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const targetUser = await User.findOne({
        username: username
      }).session(session);
      if (!targetUser) {
        await session.abortTransaction();
        return res.status(404).json({
          msg: 'User not found.'
        });
      }
      const currentUser = await User.findById(req.user._id).session(session);
      if (!currentUser.following.includes(targetUser._id)) {
        await session.abortTransaction();
        return res.status(400).json({
          msg: 'Not following this user.'
        });
      }
      await User.findByIdAndUpdate(
        req.user._id, {
          $pull: {
            following: targetUser._id
          },
          $inc: {
            following_count: -1
          }
        }, {
          new: true,
          session
        }
      );
      await User.findByIdAndUpdate(
        targetUser._id, {
          $pull: {
            followers: req.user._id
          },
          $inc: {
            followers_count: -1
          }
        }, {
          new: true,
          session
        }
      );
      await session.commitTransaction();
      return res.status(200).json({
        msg: 'Unfollowed user successfully.'
      });
    } catch (err) {
      await session.abortTransaction();
      console.error('Unfollow user error:', err);
      return res.status(500).json({
        msg: 'Failed to unfollow user.',
        error: err.message
      });
    } finally {
      session.endSession();
    }
  })
);

router.put("/edit-profile", protectRoute, asyncHandler(async (req, res) => {
  let {
    name,
    description,
    show_following
  } = req.body;
  const user = await User.findById(req.user._id);
  try {
    user.name = name.length ? name : user.name;
    user.description = description.length ? description : user.description;
    user.settings.following_hidden = !show_following;
    await user.save();
    return res.json({
      msg: "User profile updated.",
      success: true
    })
  } catch (err) {
    return res.status(400).json({
      msg: err.message || "Could not update user profile."
    })
  }
}))


export default router;