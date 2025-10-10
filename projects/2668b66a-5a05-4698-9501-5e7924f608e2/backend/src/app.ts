// Express app setup
import express from 'express';
import cors from 'cors';
import authRoutes from './authentication/routes/auth';
import userRoutes from './user-management/routes/users';
import employeeRoutes from './employee-management/routes/employees';
import auditRoutes from './audit-trail/routes/audit';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/audit', auditRoutes);

export default app;
