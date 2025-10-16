import { Request, Response } from 'express';
import { getCNCRMappings, getCNCRMappingByTitle, createCNCRMapping, updateCNCRMapping, deleteCNCRMapping } from '../services/cncrService';
import { validateCNCRMapping } from '../utils/validation';

export async function listCNCRMappings(req: Request, res: Response) {
  const mappings = await getCNCRMappings();
  res.json(mappings);
}

export async function getCNCRMapping(req: Request, res: Response) {
  const mapping = await getCNCRMappingByTitle(req.params.title);
  if (!mapping) return res.status(404).json({ error: 'CNCRMapping not found' });
  res.json(mapping);
}

export async function createCNCRMappingHandler(req: Request, res: Response) {
  const { valid, errors } = validateCNCRMapping(req.body);
  if (!valid) return res.status(400).json({ errors });
  const created = await createCNCRMapping(req.body);
  res.status(201).json(created);
}

export async function updateCNCRMappingHandler(req: Request, res: Response) {
  const updated = await updateCNCRMapping(req.params.title, req.body);
  if (!updated) return res.status(404).json({ error: 'CNCRMapping not found' });
  res.json(updated);
}

export async function deleteCNCRMappingHandler(req: Request, res: Response) {
  const deleted = await deleteCNCRMapping(req.params.title);
  if (!deleted) return res.status(404).json({ error: 'CNCRMapping not found' });
  res.json({ success: true });
}
