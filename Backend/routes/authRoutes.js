import {
  generateToken,
  protectRoute
} from "../middlewares/authMiddleware.js";
import express from "express";
import asyncHandler from "express-async-handler";
import userModel from "../models/userModel.js";
import dotenv from "dotenv";
import {
  OAuth2Client
} from "google-auth-library";
import {
  fetchProfileImage
} from "../utils.js";
import Image from "../models/imageModel.js";

dotenv.config();

const router = express.Router();

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BACKEND_URL}/api/auth/google/callback`
);


router.get("/google", (req, res) => {
  const url = googleClient.generateAuthUrl({
    scope: ["openid", "email", "profile"],
    redirect_uri: `${process.env.BACKEND_URL}/api/auth/google/callback`,
  });
  res.redirect(url);
});

// Google OAuth Callback
router.get("/google/callback", async (req, res) => {
  try {
    const {
      code
    } = req.query;
    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=Missing%20authorization%20code`);
    }

    const {
      tokens
    } = await googleClient.getToken(code);
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const {
      sub: googleId,
      email,
      name,
      picture
    } = payload;

    console.log("google finished")

    let user = await userModel.findOne({
      $or: [{
        googleId
      }, {
        email
      }]
    });
    let image = null;
    if (!user || !user.profileImage) {
      let profileBuffer = null;
      if (picture) {
        profileBuffer = await fetchProfileImage(picture);
      }

      if (profileBuffer) {
        try {
          image = new Image({
            data: profileBuffer.data,
            contentType: profileBuffer.contentType,
          })
          await image.save();
        } catch (err) {
          image = null;
        }

      }
    }

    if (!user) {
      let basename = email.split("@")[0];
      while (await userModel.findOne({
          username: basename
        })) {
        basename += Math.floor(Math.random() * 10);
      }
      user = new userModel({
        email,
        name,
        username: basename,
        googleId,
        profileImage: image ? `/images/${image._id}` : `/images/${process.env.DEFAULT_PROFILE_IMAGE_ID}`,
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.profileImage = user.profileImage || image ? `/images/${image._id}` : `/images/${process.env.DEFAULT_PROFILE_IMAGE_ID}`;
      await user.save();
    }

    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "none"
    });
    res.redirect(`${process.env.FRONTEND_URL}/me`);
  } catch (err) {
    console.error("Google callback error:", err);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=Google%20authentication%20failed`);
  }
});


const registerRoute = asyncHandler(async (req, res) => {
  if (!req.body) return res.status(400).json({
    msg: "Provide necessary information."
  });
  const {
    name,
    email,
    password
  } = req?.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      msg: "Provide necessary information."
    })
  }
  const emailVerify = await userModel.findOne({
    email: email
  });
  if (emailVerify) {
    return res.status(409).json({
      msg: "User already exists with this email."
    })
  }

  const user = new userModel({
    name: name,
    email: email,
    username: email.split("@")[0],
    password: password
  });
  try {
    await user.save();
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        msg: err.message
      })
    }
    return res.status(500).json({
      msg: "Unable to create user."
    })
  }

  const Token = generateToken(user);
  res.cookie("token", Token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: "none"
  });
  return res.status(200).json({
    msg: "Registered successfully.",
    user
  });
})

const loginRoute = asyncHandler(async (req, res) => {
  if (!req.body) return res.status(400).json({
    msg: "Provide necessary information."
  });
  const {
    email,
    password
  } = req?.body;
  if (!email || !password) {
    return res.status(400).json({
      msg: "Provide necessary information."
    })
  }
  const user = await userModel.findOne({
    email: email
  });
  if (!user || !user.password) {
    return res.status(404).json({
      msg: "Invalid credentials."
    })
  }
  const correctPassword = await user.comparePassword(password);
  if (!correctPassword) {
    return res.status(401).json({
      msg: "Incorrect password."
    })
  }
  const Token = generateToken(user);

  res.cookie("token", Token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: "none"
  });
  return res.json({
    msg: "Logged in succesfully.",
    user
  });

})

const logoutRoute = asyncHandler(async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none'
  });

  res.json({
    msg: 'Logged out successfully'
  });
})

const meRoute = asyncHandler(async (req, res) => {
  let usr = req.user.toObject();
  delete usr.posts;
  delete usr.password;
  delete usr.followers;
  delete usr.following;
  delete usr.email;
  delete usr.posts;
  return res.json({
    user: usr
  });
})

router.post("/register", registerRoute);
router.post("/login", loginRoute);
router.post("/logout", protectRoute, logoutRoute);
router.get("/me", protectRoute, meRoute);

export default router;