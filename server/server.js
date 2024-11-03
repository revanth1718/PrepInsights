import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import cors from 'cors';
import { initializeFirebase } from './config/firebaseConfig.js';
import authRoutes from './routes/authRoutes.js';
import addBlog from './routes/addBlog.js'
import blogRouter from './routes/blogRouter.js'
import ProfileRoutes from './routes/ProfileRoutes.js'
import { errorHandler } from './middleware/errorHandler.js';
import { connectDB } from './database.js';
import {verifyJWT} from "./middleware/verifyJWT.js"
import connectCloudinary  from './config/cloudinary.js';
import { cloudinaryUpload } from './utils/cloudinary.js';
import bodyParser from 'body-parser';

import {
    uploadPhoto,
    blogImgResize,
  } from './middleware/imageUploadMiddleWare.js';

const server = express();
const PORT = process.env.PORT || 3000;


// Initialize Firebase
initializeFirebase();

// Middleware
server.use(cors());
server.use(express.json({ limit: '2mb' })); // Increase as needed
server.use(express.urlencoded({ limit: '2mb', extended: true }));


// Connect to MongoDB
connectDB();
connectCloudinary();

// Routes
server.use('/auth', authRoutes);
server.use("/upload",verifyJWT,addBlog)
server.use("/blogs",blogRouter)
server.use("/profile",ProfileRoutes)


server.post(
    '/upload1',
    uploadPhoto.array('images', 10),
    blogImgResize,
    async (req, res) => {
      try {
        const uploader = (path) => cloudinaryUpload(path, 'images');
        const urls = [];
        const files = req.files;
        for (const file of files) {
          const { path } = file;
          const newpath = await uploader(path);
          // console.log(newpath);
          urls.push(newpath);
          // fs.unlinkSync(path);
        }
        const images = urls.map((file) => {
          return file;
        });
        res.json(images);
        // console.log(images);
      } catch (error) {
        throw new Error(error);
      }
    }
  );

// Error handling middleware
server.use(errorHandler);

server.listen(PORT, () => {
    console.log('Listening on port -> ' + PORT);
});
