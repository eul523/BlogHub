import { Types } from 'mongoose';
import express from "express";
import postRoutes from "./routes/postRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import { connectDB } from "./utils.js";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import mongoose from "mongoose";
import Image from './models/imageModel.js';
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();
const uri = process.env.MONGODBURI;
const port = process.env.PORT;

connectDB(uri);
mongoose.connection.on("disconnected", () => connectDB(uri));


const app = express();
const corsOptions = {
  origin: ["http://localhost:5173","http://192.168.56.1:5173","http://192.168.1.11:5173"], 
  credentials: true, 
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none"); // Allow cross-origin postMessage
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp"); // Optional, adjust if needed
  next();
});


// route to serve image binary
app.get('/api/images/:id', async (req, res) => {
  let id = req.params.id;
  if (id === 'default-profile-image'){
    id = process.env.DEFAULT_PROFILE_IMAGE_ID;
  }
  if (!Types.ObjectId.isValid(id)) return res.status(400).send('Invalid id');

  try {
    const img = await Image.findById(id).select('+data');
    if (!img) return res.status(404).send('Not found');

    res.setHeader('Content-Type', img.contentType || 'application/octet-stream');
    res.setHeader('Content-Length', img.size || img.data.length);
    // inline display
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Content-Disposition', `inline; filename="${img.filename || id}"`);
    return res.send(img.data);
  } catch (err) {
    return res.status(500).send('Server error');
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMAGE_DIR = path.join(__dirname, "assets");


app.get("/assets/:filename", (req, res) => {
  const fileName = req.params.filename;

  if (fileName.includes("..") || fileName.includes("/")) {
    return res.status(400).send("Invalid filename");
  }
  const filePath = path.join(IMAGE_DIR, fileName);


  if (!filePath.startsWith(IMAGE_DIR)) {
    return res.status(400).send("Invalid file path");
  }
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send("Image not found");
    }
    res.sendFile(filePath);
  });
});

app.use("/api/posts", postRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/search", searchRoutes);

app.use((req, res) => {
    return res.status(404).json({msg:"No route found."});
})

app.use((err, req, res) => {
    const status = err.status || 500;
    const msg = err.message || "Internal server error.";
    return res.status(status).json({msg:msg});
})
app.listen(port);
