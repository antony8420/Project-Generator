import { FormInstance } from '../models/FormInstance';
import fs from 'fs/promises';
const DATA_PATH = 'backend/data/formInstances.json';

export async function getFormInstances(): Promise<FormInstance[]> {
  const data = await fs.readFile(DATA_PATH, 'utf-8');
  return JSON.parse(data);
}

export async function getFormInstanceById(id: string): Promise<FormInstance | undefined> {
  const instances = await getFormInstances();
  return instances.find(i => i.id === id);
}

export async function createFormInstance(instance: FormInstance): Promise<FormInstance> {
  const instances = await getFormInstances();
  instances.push(instance);
  await fs.writeFile(DATA_PATH, JSON.stringify(instances, null, 2));
  return instance;
}

export async function updateFormInstance(id: string, update: Partial<FormInstance>): Promise<FormInstance | undefined> {
  const instances = await getFormInstances();
  const idx = instances.findIndex(i => i.id === id);
  if (idx === -1) return undefined;
  instances[idx] = { ...instances[idx], ...update };
  await fs.writeFile(DATA_PATH, JSON.stringify(instances, null, 2));
  return instances[idx];
}

export async function deleteFormInstance(id: string): Promise<boolean> {
  const instances = await getFormInstances();
  const filtered = instances.filter(i => i.id !== id);
  if (filtered.length === instances.length) return false;
  await fs.writeFile(DATA_PATH, JSON.stringify(filtered, null, 2));
  return true;
}
