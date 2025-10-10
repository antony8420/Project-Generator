import express from 'express';
import { calculate } from '../controllers/CalculatorController';

const router = express.Router();

router.post('/calculate', calculate);

export default router;
