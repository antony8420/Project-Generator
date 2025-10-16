import { FormTemplate } from '../models/FormTemplate';
import fs from 'fs/promises';
const DATA_PATH = 'backend/data/formTemplates.json';

export async function getFormTemplates(): Promise<FormTemplate[]> {
  const data = await fs.readFile(DATA_PATH, 'utf-8');
  return JSON.parse(data);
}

export async function getFormTemplateById(id: string): Promise<FormTemplate | undefined> {
  const templates = await getFormTemplates();
  return templates.find(t => t.id === id);
}

export async function createFormTemplate(template: FormTemplate): Promise<FormTemplate> {
  const templates = await getFormTemplates();
  templates.push(template);
  await fs.writeFile(DATA_PATH, JSON.stringify(templates, null, 2));
  return template;
}

export async function updateFormTemplate(id: string, update: Partial<FormTemplate>): Promise<FormTemplate | undefined> {
  const templates = await getFormTemplates();
  const idx = templates.findIndex(t => t.id === id);
  if (idx === -1) return undefined;
  templates[idx] = { ...templates[idx], ...update };
  await fs.writeFile(DATA_PATH, JSON.stringify(templates, null, 2));
  return templates[idx];
}

export async function deleteFormTemplate(id: string): Promise<boolean> {
  const templates = await getFormTemplates();
  const filtered = templates.filter(t => t.id !== id);
  if (filtered.length === templates.length) return false;
  await fs.writeFile(DATA_PATH, JSON.stringify(filtered, null, 2));
  return true;
}
