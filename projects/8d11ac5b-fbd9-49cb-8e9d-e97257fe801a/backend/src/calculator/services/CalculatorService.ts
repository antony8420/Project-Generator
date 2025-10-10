import fs from 'fs/promises';
import path from 'path';

const HISTORY_PATH = path.join(__dirname, '../../../data/calculator/history.json');

function safeEval(expr: string): number {
  // Simple safe eval for basic arithmetic
  if (!/^[-+*/().\d\s]+$/.test(expr)) throw new Error('Invalid characters in expression');
  // eslint-disable-next-line no-eval
  return Function(`"use strict";return (${expr})`)();
}

async function readHistory(): Promise<{ expression: string; result: number; timestamp: string }[]> {
  try {
    const data = await fs.readFile(HISTORY_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeHistory(history: { expression: string; result: number; timestamp: string }[]) {
  await fs.writeFile(HISTORY_PATH, JSON.stringify(history, null, 2));
}

export const CalculatorService = {
  async calculate(expression: string): Promise<number> {
    const result = safeEval(expression);
    const history = await readHistory();
    history.push({ expression, result, timestamp: new Date().toISOString() });
    await writeHistory(history);
    return result;
  }
};
