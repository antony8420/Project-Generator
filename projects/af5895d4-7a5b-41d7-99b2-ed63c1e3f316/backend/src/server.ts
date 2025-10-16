import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { employeeRoutes } from './employees/routes/employeeRoutes';
import { formTemplateRoutes } from './formTemplates/routes/formTemplateRoutes';
import { formInstanceRoutes } from './formInstances/routes/formInstanceRoutes';
import { answerRoutes } from './answers/routes/answerRoutes';
import { reflexRoutes } from './reflexes/routes/reflexRoutes';
import { cncrRoutes } from './cncr/routes/cncrRoutes';
import { signatureRoutes } from './signatures/routes/signatureRoutes';
import { auditRoutes } from './audit/routes/auditRoutes';

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

app.use('/api/employees', employeeRoutes);
app.use('/api/formTemplates', formTemplateRoutes);
app.use('/api/formInstances', formInstanceRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/reflexes', reflexRoutes);
app.use('/api/cncr', cncrRoutes);
app.use('/api/signatures', signatureRoutes);
app.use('/api/audit', auditRoutes);

app.use((err : any, req:any, res:any, next:any) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`E-Forms Reflex backend running on port ${PORT}`);
});
