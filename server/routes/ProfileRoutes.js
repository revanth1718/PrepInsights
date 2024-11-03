import express from 'express';
import { generateImgLink, getNotificationCount, getNotifications, getProfile , Notify, UpdateProfile, UpdateProfileImage } from '../controllers/Profilecontroller.js';
import { verifyJWT } from '../middleware/verifyJWT.js';

const router = express.Router();

router.post("/get-profile",getProfile)
router.post("/update-profile",verifyJWT,UpdateProfile)
router.post('/generate-img-link',generateImgLink)
router.post('/update-profile-img',verifyJWT,UpdateProfileImage)
router.get('/new-notification',verifyJWT,Notify)
router.post('/notifications',verifyJWT,getNotifications)
router.post('/all-notifications-count',verifyJWT,getNotificationCount)

export default router;
