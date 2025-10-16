import { Request, Response } from 'express';
import { getSignatures, getSignatureById, createSignature, updateSignature, deleteSignature } from '../services/signatureService';
import { validateSignature } from '../utils/validation';
import { v4 as uuidv4 } from 'uuid';

export async function listSignatures(req: Request, res: Response) {
  const signatures = await getSignatures();
  res.json(signatures);
}

export async function getSignature(req: Request, res: Response) {
  const signature = await getSignatureById(req.params.id);
  if (!signature) return res.status(404).json({ error: 'Signature not found' });
  res.json(signature);
}

export async function createSignatureHandler(req: Request, res: Response) {
  const { valid, errors } = validateSignature(req.body);
  if (!valid) return res.status(400).json({ errors });
  const signature = { ...req.body, id: uuidv4(), timestamp: new Date().toISOString() };
  const created = await createSignature(signature);
  res.status(201).json(created);
}

export async function updateSignatureHandler(req: Request, res: Response) {
  const updated = await updateSignature(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Signature not found' });
  res.json(updated);
}

export async function deleteSignatureHandler(req: Request, res: Response) {
  const deleted = await deleteSignature(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Signature not found' });
  res.json({ success: true });
}
