import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const geminiClient = {
  validateAnswer: async (prompt, answer) => {
    console.log(`[geminiClient] Starting validation:`);
    console.log(`  - Prompt: "${prompt.trim()}"`);
    console.log(`  - Answer: "${answer}"`);
    
    if (!answer || answer.trim().length === 0) {
      console.log(`[geminiClient] Empty answer received`);
      return { valid: false, message: 'جواب خالی ہے' };
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      let taskDescription = '';
      
      // Determine the type of question based on the prompt content
      console.log(`[geminiClient] Analyzing prompt content to determine question type`);
      
      if (prompt.includes('نام') || prompt.includes('name')) {
        taskDescription = `Extract and validate the name from the user's response. Return a clean name in Urdu.`;
        console.log(`[geminiClient] Detected NAME question type`);
      }
      else if (prompt.includes('پیشہ') || prompt.includes('profession')) {
        taskDescription = `Extract and validate the profession from the user's response. Return clean profession in Urdu.`;
        console.log(`[geminiClient] Detected PROFESSION question type`);
      }
      else if (prompt.includes('تعلیم') || prompt.includes('education')) {
        taskDescription = `Extract and validate education information from the user's response. Return clean education details in Urdu.`;
        console.log(`[geminiClient] Detected EDUCATION question type`);
      }
      else if (prompt.includes('مہارتیں') || prompt.includes('skills')) {
        taskDescription = `Extract and validate skills information from the user's response. Return clean skills in Urdu.`;
        console.log(`[geminiClient] Detected SKILLS question type`);
      }
      else if (prompt.includes('تجربہ') || prompt.includes('experience')) {
        taskDescription = `Extract and validate work experience from the user's response. Return clean experience details in Urdu.`;
        console.log(`[geminiClient] Detected EXPERIENCE question type`);
      }
      else if (prompt.includes('سرٹیفیکیشن') || prompt.includes('certifications')) {
        taskDescription = `Extract and validate certifications from the user's response. Return clean certification details in Urdu. If no certifications, return "کوئی سرٹیفیکیشن نہیں".`;
        console.log(`[geminiClient] Detected CERTIFICATIONS question type`);
      }
      else if (prompt.includes('پتہ') || prompt.includes('address')) {
        taskDescription = `Extract and validate the address from the user's response. Return clean address with city in Urdu.`;
        console.log(`[geminiClient] Detected ADDRESS question type`);
      }
      else if (prompt.includes('رابطہ') || prompt.includes('فون') || prompt.includes('contact')) {
        taskDescription = `Extract and validate phone number from the user's response. Return clean phone number.`;
        console.log(`[geminiClient] Detected CONTACT question type`);
      }
      else {
        taskDescription = `Extract and validate information from the user's response. Return clean information in Urdu.`;
        console.log(`[geminiClient] Using default question type (prompt content not recognized)`);
      }

      console.log(`[geminiClient] Task description: "${taskDescription}"`);

      const fullPrompt = `You are a helpful assistant that processes user responses in Urdu.

Task: ${taskDescription}

User's response: "${answer}"

Please analyze this response and return a JSON object with the following structure:
{
  "valid": true/false,
  "message": "explanation in Urdu",
  "extractedInfo": "clean extracted information in Urdu"
}

Rules:
- If the response contains valid information, set "valid" to true and provide the extracted information
- If the response is invalid or unclear, set "valid" to false and explain why in Urdu
- Always return valid JSON format
- Keep the extracted information concise and clear
- For names: extract only the actual name
- For education: extract education level/degree
- For skills: extract professional skills/trades
- For experience: extract work experience details
- For contact: extract only the phone number

Return only the JSON object, no additional text.`;

      console.log(`[geminiClient] Sending request to Gemini AI`);
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text().trim();
      
      console.log(`[geminiClient] Gemini AI response: "${text}"`);
      
      // Try to parse JSON response
      try {
        // Clean the response to extract JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[0];
          const parsedResponse = JSON.parse(jsonStr);
          
          console.log(`[geminiClient] Successfully parsed JSON response:`, parsedResponse);
          
          return {
            valid: parsedResponse.valid,
            message: parsedResponse.message,
            extractedInfo: parsedResponse.extractedInfo
          };
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error(`[geminiClient] JSON parsing error:`, parseError);
        console.log(`[geminiClient] Raw response: "${text}"`);
        
        // Fallback: try to extract information from text response
        if (text.toLowerCase().includes('valid') && text.toLowerCase().includes('true')) {
          // Try to extract information after "extractedInfo":
          const extractedMatch = text.match(/extractedInfo["\s]*:["\s]*([^"]+)/i);
          const extractedInfo = extractedMatch ? extractedMatch[1].trim() : answer;
          
          console.log(`[geminiClient] Using fallback extraction: "${extractedInfo}"`);
          
          return {
            valid: true,
            message: 'جواب درست ہے',
            extractedInfo: extractedInfo
          };
        } else {
          console.log(`[geminiClient] Fallback validation failed, marking as invalid`);
          return {
            valid: false,
            message: 'جواب واضح نہیں ہے، دوبارہ کوشش کریں',
            extractedInfo: ''
          };
        }
      }
    } catch (error) {
      console.error(`[geminiClient] Gemini AI error:`, error);
      return {
        valid: false,
        message: 'جواب کی تصدیق میں مسئلہ ہوا ہے',
        extractedInfo: ''
      };
    }
  },

  translateToEnglish: async (urduText) => {
    if (!urduText || !urduText.trim()) return '';
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `Translate the following text from Urdu to English, keeping it natural and suitable for a resume. Only return the English translation, no extra text or explanation.\n\nUrdu: "${urduText}"`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      // Remove any extra quotes or whitespace
      return text.replace(/^"|"$/g, '').trim();
    } catch (error) {
      console.error('[geminiClient] Gemini translation error:', error);
      return urduText;
    }
  }
};

export default geminiClient;
