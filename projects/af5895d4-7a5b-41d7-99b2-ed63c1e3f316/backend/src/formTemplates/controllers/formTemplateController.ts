import { Request, Response } from 'express';
import { getFormTemplates, getFormTemplateById, createFormTemplate, updateFormTemplate, deleteFormTemplate } from '../services/formTemplateService';
import { validateFormTemplate } from '../utils/validation';
import { v4 as uuidv4 } from 'uuid';

export async function listFormTemplates(req: Request, res: Response) {
  const templates = await getFormTemplates();
  res.json(templates);
}

export async function getFormTemplate(req: Request, res: Response) {
  const template = await getFormTemplateById(req.params.id);
  if (!template) return res.status(404).json({ error: 'FormTemplate not found' });
  res.json(template);
}

export async function createFormTemplateHandler(req: Request, res: Response) {
  const { valid, errors } = validateFormTemplate(req.body);
  if (!valid) return res.status(400).json({ errors });
  const template = { ...req.body, id: uuidv4() };
  const created = await createFormTemplate(template);
  res.status(201).json(created);
}

export async function updateFormTemplateHandler(req: Request, res: Response) {
  const updated = await updateFormTemplate(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'FormTemplate not found' });
  res.json(updated);
}

export async function deleteFormTemplateHandler(req: Request, res: Response) {
  const deleted = await deleteFormTemplate(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'FormTemplate not found' });
  res.json({ success: true });
}
