import { Router } from 'express';
import { listReflexes, getReflex, createReflexHandler, updateReflexHandler, deleteReflexHandler } from '../controllers/reflexController';

export const reflexRoutes = Router();

reflexRoutes.get('/', listReflexes);
reflexRoutes.get('/:id', getReflex);
reflexRoutes.post('/', createReflexHandler);
reflexRoutes.put('/:id', updateReflexHandler);
reflexRoutes.delete('/:id', deleteReflexHandler);
