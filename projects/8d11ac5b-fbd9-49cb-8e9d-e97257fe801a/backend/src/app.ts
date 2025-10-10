import express from 'express';
import patientRoutes from './patient-onboarding/routes/patient';
import calculatorRoutes from './calculator/routes/calculator';
import authRoutes from './patient-onboarding/routes/auth';
import path from 'path';

const app = express();
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/calculator', calculatorRoutes);

export default app;
