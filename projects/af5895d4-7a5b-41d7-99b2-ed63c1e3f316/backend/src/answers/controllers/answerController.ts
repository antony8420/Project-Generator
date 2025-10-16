import { Request, Response } from 'express';
import { getAnswers, getAnswerById, createAnswer, updateAnswer, deleteAnswer } from '../services/answerService';
import { validateAnswer } from '../utils/validation';
import { v4 as uuidv4 } from 'uuid';

export async function listAnswers(req: Request, res: Response) {
  const answers = await getAnswers();
  res.json(answers);
}

export async function getAnswer(req: Request, res: Response) {
  const answer = await getAnswerById(req.params.id);
  if (!answer) return res.status(404).json({ error: 'Answer not found' });
  res.json(answer);
}

export async function createAnswerHandler(req: Request, res: Response) {
  const { valid, errors } = validateAnswer(req.body);
  if (!valid) return res.status(400).json({ errors });
  const answer = { ...req.body, id: uuidv4() };
  const created = await createAnswer(answer);
  res.status(201).json(created);
}

export async function updateAnswerHandler(req: Request, res: Response) {
  const updated = await updateAnswer(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Answer not found' });
  res.json(updated);
}

export async function deleteAnswerHandler(req: Request, res: Response) {
  const deleted = await deleteAnswer(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Answer not found' });
  res.json({ success: true });
}
