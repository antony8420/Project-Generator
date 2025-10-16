import { Request, Response } from 'express';
import { getReflexes, getReflexById, createReflex, updateReflex, deleteReflex } from '../services/reflexService';
import { validateReflex } from '../utils/validation';
import { v4 as uuidv4 } from 'uuid';

export async function listReflexes(req: Request, res: Response) {
  const reflexes = await getReflexes();
  res.json(reflexes);
}

export async function getReflex(req: Request, res: Response) {
  const reflex = await getReflexById(req.params.id);
  if (!reflex) return res.status(404).json({ error: 'Reflex not found' });
  res.json(reflex);
}

export async function createReflexHandler(req: Request, res: Response) {
  const { valid, errors } = validateReflex(req.body);
  if (!valid) return res.status(400).json({ errors });
  const reflex = { ...req.body, id: uuidv4() };
  const created = await createReflex(reflex);
  res.status(201).json(created);
}

export async function updateReflexHandler(req: Request, res: Response) {
  const updated = await updateReflex(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Reflex not found' });
  res.json(updated);
}

export async function deleteReflexHandler(req: Request, res: Response) {
  const deleted = await deleteReflex(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Reflex not found' });
  res.json({ success: true });
}
