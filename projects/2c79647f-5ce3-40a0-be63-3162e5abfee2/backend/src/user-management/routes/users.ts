// User management routes
import express from 'express';
import UserController from '../controllers/UserController';
import auth from '../../authentication/middleware/auth';
import role from '../../authentication/middleware/role';

const router = express.Router();

router.get('/', auth, role(['HR_ADMIN']), UserController.listUsers);
router.get('/me', auth, UserController.getMe);

export default router;
