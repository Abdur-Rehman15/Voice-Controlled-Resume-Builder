import fs from 'fs';
import path from 'path';
import geminiClient from '../utils/geminiClient.js';

export const validateAnswer = async (req, res) => {
  const { questionType, answer } = req.body;
  if (!questionType || !answer) {
    return res.status(400).json({ valid: false, message: 'Missing questionType or answer' });
  }
  try {
    // Fix the path to read from prompts directory
    const promptPath = path.join(process.cwd(), 'prompts', `${questionType}Prompt.txt`);
    console.log('Reading prompt from:', promptPath);
    
    // Check if file exists
    if (!fs.existsSync(promptPath)) {
      console.log('Prompt file not found, using default validation');
      // If file doesn't exist, use default validation
      const validationResult = await geminiClient.validateAnswer('', answer);
      return res.json(validationResult);
    }
    
    const prompt = fs.readFileSync(promptPath, 'utf-8');
    console.log('Prompt content:', prompt);
    console.log('Answer to validate:', answer);
    
    const validationResult = await geminiClient.validateAnswer(prompt, answer);
    console.log('Validation result:', validationResult);
    res.json(validationResult);
  } catch (err) {
    console.error('Validation error:', err);
    res.status(500).json({ valid: false, message: 'Validation error', error: err.message });
  }
};
