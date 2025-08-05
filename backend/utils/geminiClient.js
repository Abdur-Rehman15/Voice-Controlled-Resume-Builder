import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const geminiClient = {
  validateAnswer: async (prompt, answer) => {
    console.log('Validating answer:', answer);
    console.log('With prompt:', prompt);
    
    if (!answer || answer.trim().length === 0) {
      return { valid: false, message: 'جواب خالی ہے' };
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      let taskDescription = '';
      
      // Determine the type of question based on the prompt
      if (prompt.includes('نام')) {
        taskDescription = `Extract and validate the name from the user's response. Return a clean name in Urdu.`;
      }
      else if (prompt.includes('تعلیم') || prompt.includes('education')) {
        taskDescription = `Extract and validate education information from the user's response. Return clean education details in Urdu.`;
      }
      else if (prompt.includes('مہارتیں') || prompt.includes('skills')) {
        taskDescription = `Extract and validate skills information from the user's response. Return clean skills in Urdu.`;
      }
      else if (prompt.includes('تجربہ') || prompt.includes('experience')) {
        taskDescription = `Extract and validate work experience from the user's response. Return clean experience details in Urdu.`;
      }
      else if (prompt.includes('رابطہ') || prompt.includes('فون') || prompt.includes('contact')) {
        taskDescription = `Extract and validate phone number from the user's response. Return clean phone number.`;
      }
      else {
        taskDescription = `Extract and validate information from the user's response. Return clean information in Urdu.`;
      }

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

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text().trim();
      
      console.log('Gemini response:', text);
      
      // Try to parse JSON response
      try {
        // Clean the response to extract JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[0];
          const parsedResponse = JSON.parse(jsonStr);
          
          return {
            valid: parsedResponse.valid,
            message: parsedResponse.message,
            extractedInfo: parsedResponse.extractedInfo
          };
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        console.log('Raw response:', text);
        
        // Fallback: try to extract information from text response
        if (text.toLowerCase().includes('valid') && text.toLowerCase().includes('true')) {
          // Try to extract information after "extractedInfo":
          const extractedMatch = text.match(/extractedInfo["\s]*:["\s]*([^"]+)/i);
          const extractedInfo = extractedMatch ? extractedMatch[1].trim() : answer;
          
          return {
            valid: true,
            message: 'جواب درست ہے',
            extractedInfo: extractedInfo
          };
        } else {
          return {
            valid: false,
            message: 'جواب درست نہیں ہے، دوبارہ کوشش کریں',
            extractedInfo: answer
          };
        }
      }
      
    } catch (error) {
      console.error('Gemini API error:', error);
      // Fallback to basic validation if API fails
      if (answer.trim().length >= 3) {
        return { valid: true, message: 'جواب درست ہے', extractedInfo: answer };
      } else {
        return { valid: false, message: 'جواب بہت چھوٹا ہے، مزید تفصیل دیں' };
      }
    }
  }
};

export default geminiClient;
