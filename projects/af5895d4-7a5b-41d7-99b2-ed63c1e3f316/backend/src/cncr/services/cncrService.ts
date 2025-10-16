import { CNCRMapping } from '../models/CNCRMapping';
import fs from 'fs/promises';
const DATA_PATH = 'backend/data/cncr.json';

export async function getCNCRMappings(): Promise<CNCRMapping[]> {
  const data = await fs.readFile(DATA_PATH, 'utf-8');
  return JSON.parse(data);
}

export async function getCNCRMappingByTitle(title: string): Promise<CNCRMapping | undefined> {
  const mappings = await getCNCRMappings();
  return mappings.find(m => m.document_title === title);
}

export async function createCNCRMapping(mapping: CNCRMapping): Promise<CNCRMapping> {
  const mappings = await getCNCRMappings();
  mappings.push(mapping);
  await fs.writeFile(DATA_PATH, JSON.stringify(mappings, null, 2));
  return mapping;
}

export async function updateCNCRMapping(title: string, update: Partial<CNCRMapping>): Promise<CNCRMapping | undefined> {
  const mappings = await getCNCRMappings();
  const idx = mappings.findIndex(m => m.document_title === title);
  if (idx === -1) return undefined;
  mappings[idx] = { ...mappings[idx], ...update };
  await fs.writeFile(DATA_PATH, JSON.stringify(mappings, null, 2));
  return mappings[idx];
}

export async function deleteCNCRMapping(title: string): Promise<boolean> {
  const mappings = await getCNCRMappings();
  const filtered = mappings.filter(m => m.document_title !== title);
  if (filtered.length === mappings.length) return false;
  await fs.writeFile(DATA_PATH, JSON.stringify(filtered, null, 2));
  return true;
}
