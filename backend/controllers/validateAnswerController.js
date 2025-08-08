import fs from 'fs';
import path from 'path';
import geminiClient from '../utils/geminiClient.js';

export const validateAnswer = async (req, res) => {
  const { questionType, answer } = req.body;
  
  console.log(`[validateAnswerController] Received validation request:`);
  console.log(`  - Question Type: "${questionType}"`);
  console.log(`  - Answer: "${answer}"`);
  
  if (!questionType || !answer) {
    console.log(`[validateAnswerController] Missing required fields`);
    return res.status(400).json({ valid: false, message: 'Missing questionType or answer' });
  }
  
  try {
    // Fix the path to read from prompts directory
    const promptPath = path.join(process.cwd(), 'prompts', `${questionType}Prompt.txt`);
    console.log(`[validateAnswerController] Reading prompt from: ${promptPath}`);
    
    // Check if file exists
    if (!fs.existsSync(promptPath)) {
      console.log(`[validateAnswerController] Prompt file not found: ${promptPath}`);
      console.log(`[validateAnswerController] Using default validation`);
      // If file doesn't exist, use default validation
      let validationResult;
      try {
        validationResult = await geminiClient.validateAnswer('', answer);
      } catch (e) {
        console.error('[validateAnswerController] Gemini validation failed:', e);
        // Fallback for contact/phone number
        if (questionType === 'contact') {
          const phoneRegex = /\d{4,}/g;
          const match = answer.match(phoneRegex);
          if (match) {
            validationResult = { valid: true, message: 'فون نمبر درست ہے', extractedInfo: match[0] };
          } else {
            validationResult = { valid: false, message: 'فون نمبر درست نہیں ہے', extractedInfo: '' };
          }
        } else {
          validationResult = { valid: false, message: 'جواب کی تصدیق میں مسئلہ ہوا ہے', extractedInfo: '' };
        }
      }
      console.log(`[validateAnswerController] Default validation result:`, validationResult);
      return res.json(validationResult);
    }
    
    const prompt = fs.readFileSync(promptPath, 'utf-8');
    console.log(`[validateAnswerController] Prompt content loaded:`);
    console.log(`  - File: ${questionType}Prompt.txt`);
    console.log(`  - Content: "${prompt.trim()}"`);
    console.log(`[validateAnswerController] Answer to validate: "${answer}"`);
    
    const validationResult = await geminiClient.validateAnswer(prompt, answer);
    console.log(`[validateAnswerController] Validation result:`, validationResult);
    
    res.json(validationResult);
  } catch (err) {
    console.error(`[validateAnswerController] Validation error:`, err);
    res.status(500).json({ valid: false, message: 'Validation error', error: err.message });
  }
};
