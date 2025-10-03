import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import express from "express";
import {
  protectRouteLoose
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/posts", protectRouteLoose, async (req, res) => {
  try {
    const {
      q
    } = req.query;
    const limit = 10;
    const page = parseInt(req.query.page) || 1;

    if (!q) return res.status(400).json({
      msg: "Query string required."
    });

    const skip = (page - 1) * limit;


    let posts = await Post.find({
        $text: {
          $search: q
        }
      }, {
        score: {
          $meta: "textScore"
        }
      })
      .select("title body images dateWritten author tags slug likes_count comments_count likes")
      .populate("author", "name username profileImage")
      .sort({
        score: {
          $meta: "textScore"
        }
      })
      .skip(skip)
      .limit(limit);

    let postsCount = await Post.countDocuments({
      $text: {
        $search: q
      }
    });

    // Fallback: regex search if no posts
    if (!posts.length) {
      posts = await Post.find({
          $or: [{
              title: {
                $regex: q,
                $options: "i"
              }
            },
            {
              body: {
                $regex: q,
                $options: "i"
              }
            },
            {
              tags: {
                $regex: q,
                $options: "i"
              }
            }
          ]
        })
        .select("title body images dateWritten author tags slug likes_count comments_count likes")
        .populate("author", "name username profileImage")
        .skip(skip)
        .limit(limit);

      postsCount = await Post.countDocuments({
        $or: [{
            title: {
              $regex: q,
              $options: "i"
            }
          },
          {
            body: {
              $regex: q,
              $options: "i"
            }
          },
          {
            tags: {
              $regex: q,
              $options: "i"
            }
          }
        ]
      });
    }

    posts = posts.map(p => {
      let pObj = p.toObject();
      if (req.user) {
        pObj.liked = Array.isArray(pObj.likes) && pObj.likes.some(l => String(l) === String(req.user._id));
        pObj.isFavourite = req.user.favourite_posts.some(p => String(p._id === String(pObj._id)))
        pObj.isOwner = String(req.user._id) === String(pObj.author._id);
      }
      delete pObj.likes;
      return pObj;
    })



    const totalResults = postsCount;
    const totalPages = Math.ceil(totalResults / limit);

    return res.json({
      posts,
      totalResults,
      totalPages,
      currentPage: page,
      hasNext: page < totalPages

    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Something went wrong.",
      error: err.message
    });
  }
});

router.get("/users", protectRouteLoose, async (req, res) => {
  try {
    const {
      q
    } = req.query;
    const limit = 10;
    const page = parseInt(req.query.page) || 1;

    if (!q) return res.status(400).json({
      msg: "Query string required."
    });

    const skip = (page - 1) * limit;


    let users = await User.find({
        $text: {
          $search: q
        }
      }, {
        score: {
          $meta: "textScore"
        }
      })
      .select("name username description followers_count following_count profileImage followers")
      .sort({
        score: {
          $meta: "textScore"
        }
      })
      .skip(skip)
      .limit(limit);

    let usersCount = await User.countDocuments({
      $text: {
        $search: q
      }
    });

    // Fallback: regex search if no users
    if (!users.length) {
      users = await User.find({
          $or: [{
              name: {
                $regex: q,
                $options: "i"
              }
            },
            {
              username: {
                $regex: q,
                $options: "i"
              }
            },
            {
              description: {
                $regex: q,
                $options: "i"
              }
            }
          ]
        })
        .select("name username description followers_count following_count profileImage followers")
        .skip(skip)
        .limit(limit);

      usersCount = await User.countDocuments({
        $or: [{
            name: {
              $regex: q,
              $options: "i"
            }
          },
          {
            username: {
              $regex: q,
              $options: "i"
            }
          },
          {
            description: {
              $regex: q,
              $options: "i"
            }
          }
        ]
      });
    }

    users = users.map(p => {
      let pp = p.toObject();
      if (req.user) {
        pp.isFollowing = Array.isArray(pp.followers) && pp.followers.some(l => String(l) === String(req.user._id));
        pp.isSelf = String(req.user._id) === String(pp._id);
        pp.isAuthenticated = true;
      }
      delete pp.followers;

      return pp;
    })



    const totalResults = usersCount;
    const totalPages = Math.ceil(totalResults / limit);

    return res.json({
      users,
      totalResults,
      totalPages,
      currentPage: page,
      hasNext: page < totalPages
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Something went wrong.",
      error: err.message
    });
  }
});

router.get("/autocomplete", async (req, res) => {
  try {
    const {
      q
    } = req.query;
    const limit = parseInt(req.query.limit) || 10;

    if (!q) return res.json({
      users: [],
      posts: []
    });


    const users = await User.find({
        $or: [{
            name: {
              $regex: `^${q}`,
              $options: "i"
            }
          },
          {
            username: {
              $regex: `^${q}`,
              $options: "i"
            }
          }
        ]
      })
      .select("name username profileImage")
      .limit(limit);


    const posts = await Post.find({
        $or: [{
            title: {
              $regex: `^${q}`,
              $options: "i"
            }
          },
          {
            body: {
              $regex: `^${q}`,
              $options: "i"
            }
          },
          {
            tags: {
              $regex: `^${q}`,
              $options: "i"
            }
          }
        ]
      })
      .select("title slug")
      .limit(limit);

    res.json({
      users,
      posts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Autocomplete failed",
      error: err.message
    });
  }
});


export default router;