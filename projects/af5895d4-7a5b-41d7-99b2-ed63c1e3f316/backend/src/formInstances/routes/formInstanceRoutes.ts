import { Router } from 'express';
import { listFormInstances, getFormInstance, createFormInstanceHandler, updateFormInstanceHandler, deleteFormInstanceHandler } from '../controllers/formInstanceController';

export const formInstanceRoutes = Router();

formInstanceRoutes.get('/', listFormInstances);
formInstanceRoutes.get('/:id', getFormInstance);
formInstanceRoutes.post('/', createFormInstanceHandler);
formInstanceRoutes.put('/:id', updateFormInstanceHandler);
formInstanceRoutes.delete('/:id', deleteFormInstanceHandler);
