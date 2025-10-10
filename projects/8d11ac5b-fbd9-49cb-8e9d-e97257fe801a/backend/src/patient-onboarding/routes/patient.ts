import express from 'express';
import { registerPatient } from '../controllers/PatientController';
import upload from '../middleware/upload';

const router = express.Router();

router.post('/', upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'idDocument', maxCount: 1 }
]), registerPatient);

export default router;