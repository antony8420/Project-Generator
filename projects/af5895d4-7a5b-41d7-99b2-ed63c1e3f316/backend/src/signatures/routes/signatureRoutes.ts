import { Router } from 'express';
import { listSignatures, getSignature, createSignatureHandler, updateSignatureHandler, deleteSignatureHandler } from '../controllers/signatureController';

export const signatureRoutes = Router();

signatureRoutes.get('/', listSignatures);
signatureRoutes.get('/:id', getSignature);
signatureRoutes.post('/', createSignatureHandler);
signatureRoutes.put('/:id', updateSignatureHandler);
signatureRoutes.delete('/:id', deleteSignatureHandler);
