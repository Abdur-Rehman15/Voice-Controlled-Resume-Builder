import fs from 'fs';
import path from 'path';
import geminiClient from '../utils/geminiClient.js';

export const validateAnswer = async (req, res) => {
  const { questionType, answer } = req.body;
  if (!questionType || !answer) {
    return res.status(400).json({ valid: false, message: 'Missing questionType or answer' });
  }
  try {
    const promptPath = path.join(process.cwd(), 'backend', 'prompts', `${questionType}Prompt.txt`);
    const prompt = fs.readFileSync(promptPath, 'utf-8');
    const validationResult = await geminiClient.validateAnswer(prompt, answer);
    res.json(validationResult);
  } catch (err) {
    res.status(500).json({ valid: false, message: 'Validation error', error: err.message });
  }
};
