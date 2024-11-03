import express from 'express';
import { signup, signin, googleAuth, ChangePassword } from '../controllers/authController.js';
import { verifyJWT } from '../middleware/verifyJWT.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/google-auth', googleAuth);
router.post('/change-password',verifyJWT,ChangePassword)

export default router;
