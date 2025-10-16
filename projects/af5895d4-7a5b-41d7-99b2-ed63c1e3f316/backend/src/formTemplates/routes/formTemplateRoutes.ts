import { Router } from 'express';
import { listFormTemplates, getFormTemplate, createFormTemplateHandler, updateFormTemplateHandler, deleteFormTemplateHandler } from '../controllers/formTemplateController';

export const formTemplateRoutes = Router();

formTemplateRoutes.get('/', listFormTemplates);
formTemplateRoutes.get('/:id', getFormTemplate);
formTemplateRoutes.post('/', createFormTemplateHandler);
formTemplateRoutes.put('/:id', updateFormTemplateHandler);
formTemplateRoutes.delete('/:id', deleteFormTemplateHandler);
