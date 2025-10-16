import { Router } from 'express';
import { listCNCRMappings, getCNCRMapping, createCNCRMappingHandler, updateCNCRMappingHandler, deleteCNCRMappingHandler } from '../controllers/cncrController';

export const cncrRoutes = Router();

cncrRoutes.get('/', listCNCRMappings);
cncrRoutes.get('/:title', getCNCRMapping);
cncrRoutes.post('/', createCNCRMappingHandler);
cncrRoutes.put('/:title', updateCNCRMappingHandler);
cncrRoutes.delete('/:title', deleteCNCRMappingHandler);
