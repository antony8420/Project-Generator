import { Request, Response } from 'express';
import { getFormInstances, getFormInstanceById, createFormInstance, updateFormInstance, deleteFormInstance } from '../services/formInstanceService';
import { validateFormInstance } from '../utils/validation';
import { v4 as uuidv4 } from 'uuid';

export async function listFormInstances(req: Request, res: Response) {
  const instances = await getFormInstances();
  res.json(instances);
}

export async function getFormInstance(req: Request, res: Response) {
  const instance = await getFormInstanceById(req.params.id);
  if (!instance) return res.status(404).json({ error: 'FormInstance not found' });
  res.json(instance);
}

export async function createFormInstanceHandler(req: Request, res: Response) {
  const { valid, errors } = validateFormInstance(req.body);
  if (!valid) return res.status(400).json({ errors });
  const instance = { ...req.body, id: uuidv4(), status: 'Open', locked_by: null, locked_on: null };
  const created = await createFormInstance(instance);
  res.status(201).json(created);
}

export async function updateFormInstanceHandler(req: Request, res: Response) {
  const updated = await updateFormInstance(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'FormInstance not found' });
  res.json(updated);
}

export async function deleteFormInstanceHandler(req: Request, res: Response) {
  const deleted = await deleteFormInstance(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'FormInstance not found' });
  res.json({ success: true });
}
