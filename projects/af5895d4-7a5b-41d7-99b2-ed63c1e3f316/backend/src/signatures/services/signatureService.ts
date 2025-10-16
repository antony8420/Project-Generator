import { Signature } from '../models/Signature';
import fs from 'fs/promises';
const DATA_PATH = 'backend/data/signatures.json';

export async function getSignatures(): Promise<Signature[]> {
  const data = await fs.readFile(DATA_PATH, 'utf-8');
  return JSON.parse(data);
}

export async function getSignatureById(id: string): Promise<Signature | undefined> {
  const signatures = await getSignatures();
  return signatures.find(s => s.id === id);
}

export async function createSignature(signature: Signature): Promise<Signature> {
  const signatures = await getSignatures();
  signatures.push(signature);
  await fs.writeFile(DATA_PATH, JSON.stringify(signatures, null, 2));
  return signature;
}

export async function updateSignature(id: string, update: Partial<Signature>): Promise<Signature | undefined> {
  const signatures = await getSignatures();
  const idx = signatures.findIndex(s => s.id === id);
  if (idx === -1) return undefined;
  signatures[idx] = { ...signatures[idx], ...update };
  await fs.writeFile(DATA_PATH, JSON.stringify(signatures, null, 2));
  return signatures[idx];
}

export async function deleteSignature(id: string): Promise<boolean> {
  const signatures = await getSignatures();
  const filtered = signatures.filter(s => s.id !== id);
  if (filtered.length === signatures.length) return false;
  await fs.writeFile(DATA_PATH, JSON.stringify(filtered, null, 2));
  return true;
}
