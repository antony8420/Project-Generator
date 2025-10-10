// Express app setup
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
const app = express();
app.use(cors());
app.use(bodyParser.json());
// TODO: Import and use feature routes
export default app;