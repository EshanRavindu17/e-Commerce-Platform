import express from 'express';
import * as authController from '../controller/auth.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/login', authController.loginUser);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authMiddleware, authController.logoutUser);

export default router;