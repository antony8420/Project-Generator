import { Router } from 'express';
import { listAnswers, getAnswer, createAnswerHandler, updateAnswerHandler, deleteAnswerHandler } from '../controllers/answerController';

export const answerRoutes = Router();

answerRoutes.get('/', listAnswers);
answerRoutes.get('/:id', getAnswer);
answerRoutes.post('/', createAnswerHandler);
answerRoutes.put('/:id', updateAnswerHandler);
answerRoutes.delete('/:id', deleteAnswerHandler);
