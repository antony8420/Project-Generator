import { Answer } from '../models/Answer';
import fs from 'fs/promises';
const DATA_PATH = 'backend/data/answers.json';

export async function getAnswers(): Promise<Answer[]> {
  const data = await fs.readFile(DATA_PATH, 'utf-8');
  return JSON.parse(data);
}

export async function getAnswerById(id: string): Promise<Answer | undefined> {
  const answers = await getAnswers();
  return answers.find(a => a.id === id);
}

export async function createAnswer(answer: Answer): Promise<Answer> {
  const answers = await getAnswers();
  answers.push(answer);
  await fs.writeFile(DATA_PATH, JSON.stringify(answers, null, 2));
  return answer;
}

export async function updateAnswer(id: string, update: Partial<Answer>): Promise<Answer | undefined> {
  const answers = await getAnswers();
  const idx = answers.findIndex(a => a.id === id);
  if (idx === -1) return undefined;
  answers[idx] = { ...answers[idx], ...update };
  await fs.writeFile(DATA_PATH, JSON.stringify(answers, null, 2));
  return answers[idx];
}

export async function deleteAnswer(id: string): Promise<boolean> {
  const answers = await getAnswers();
  const filtered = answers.filter(a => a.id !== id);
  if (filtered.length === answers.length) return false;
  await fs.writeFile(DATA_PATH, JSON.stringify(filtered, null, 2));
  return true;
}
