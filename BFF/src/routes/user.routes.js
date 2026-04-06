import express from 'express';
import * as userController from '../controller/user.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', userController.registerUser);

router.post('/', userController.registerUser);
router.get('/', authMiddleware, userController.getUserProfile);
router.patch('/', authMiddleware, userController.updateUserProfile);

export default router;