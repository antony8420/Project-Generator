// User management routes
import { Router } from 'express';
import UserController from '../controllers/UserController';
import { authenticateJWT } from '../../authentication/middleware/auth';

const router = Router();

router.get('/', authenticateJWT, UserController.listUsers);
router.get('/:id', authenticateJWT, UserController.getUser);
router.post('/', authenticateJWT, UserController.createUser);
router.put('/:id', authenticateJWT, UserController.updateUser);
router.delete('/:id', authenticateJWT, UserController.deleteUser);

export default router;
