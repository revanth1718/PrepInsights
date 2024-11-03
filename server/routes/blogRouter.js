import express from 'express';
import { AddComment, DeleteBlog, deleteComment, getAllLatestBlogs, getBlog, getBlogcomments, getIsLiked, getLatestBlog, getReplies, getSearchBlog, getSearchBlogCount, getTrendingBlogs, getUers, LikeBlog, UserWrittenBlogs, UserWrittenBlogsCount } from '../controllers/blogController.js';
import { verifyJWT } from '../middleware/verifyJWT.js';
const router = express.Router();

router.post("/latest-blog",getLatestBlog)
router.get("/trending-blogs",getTrendingBlogs)
router.post("/all-latest-blogs-count",getAllLatestBlogs)
router.post("/search-blogs-count",getSearchBlogCount)
router.post('/search-blogs',getSearchBlog)
router.post('/search-users',getUers)
router.post('/get-blog',getBlog)
router.post('/like-blog',verifyJWT,LikeBlog)
router.post("/isliked-by-user",verifyJWT,getIsLiked)
router.post("/add-comment",verifyJWT,AddComment)
router.post("/get-blog-comments",getBlogcomments)
router.post("/get-replies",getReplies)
router.post("/delete-comments",verifyJWT,deleteComment)
router.post("/user-written-blogs",verifyJWT,UserWrittenBlogs)
router.post('/user-written-blogs-count',verifyJWT,UserWrittenBlogsCount)
router.post('/delete-blog',verifyJWT,DeleteBlog)

export default router;
