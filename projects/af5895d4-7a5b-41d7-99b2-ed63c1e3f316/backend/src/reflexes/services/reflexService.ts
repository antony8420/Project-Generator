import { Reflex } from '../models/Reflex';
import fs from 'fs/promises';
const DATA_PATH = 'backend/data/reflexes.json';

export async function getReflexes(): Promise<Reflex[]> {
  const data = await fs.readFile(DATA_PATH, 'utf-8');
  return JSON.parse(data);
}

export async function getReflexById(id: string): Promise<Reflex | undefined> {
  const reflexes = await getReflexes();
  return reflexes.find(r => r.id === id);
}

export async function createReflex(reflex: Reflex): Promise<Reflex> {
  const reflexes = await getReflexes();
  reflexes.push(reflex);
  await fs.writeFile(DATA_PATH, JSON.stringify(reflexes, null, 2));
  return reflex;
}

export async function updateReflex(id: string, update: Partial<Reflex>): Promise<Reflex | undefined> {
  const reflexes = await getReflexes();
  const idx = reflexes.findIndex(r => r.id === id);
  if (idx === -1) return undefined;
  reflexes[idx] = { ...reflexes[idx], ...update };
  await fs.writeFile(DATA_PATH, JSON.stringify(reflexes, null, 2));
  return reflexes[idx];
}

export async function deleteReflex(id: string): Promise<boolean> {
  const reflexes = await getReflexes();
  const filtered = reflexes.filter(r => r.id !== id);
  if (filtered.length === reflexes.length) return false;
  await fs.writeFile(DATA_PATH, JSON.stringify(filtered, null, 2));
  return true;
}
