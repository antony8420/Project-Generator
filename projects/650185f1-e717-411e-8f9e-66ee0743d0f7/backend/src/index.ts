import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

// Import feature routes
import employeeRoutes from './employees/routes/employeeRoutes';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/employees', employeeRoutes);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});