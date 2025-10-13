import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import employeeRoutes from './routes/employeeRoutes';

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/employees', employeeRoutes);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
