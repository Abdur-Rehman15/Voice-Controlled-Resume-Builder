import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

// Import routes
import validateAnswerRoutes from './routes/validateAnswer.js';
import generateResumeRoutes from './routes/generateResume.js';
import resumeRoutes from './routes/resumes.js';
import sessionRoutes from './routes/session.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/asaancv';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/validate-answer', validateAnswerRoutes);
app.use('/api/generate-resume', generateResumeRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/session', sessionRoutes);

// Text-to-Speech endpoint using Google Cloud REST API
app.post('/api/text-to-speech', async (req, res) => {
  try {
    const { text } = req.body;
    // text="محمد علی الیکٹریشن آٹھ سال کا تجربہ گھروں دکانوں اور فیکٹریوں کی وائرنگ مرمت اے سی پنکھے لائٹس اور جنریٹر کی تنصیب مرمت میں ماہر دو سال لاہور کی ایک کمپنی میں اور چھ سال سے فری لانس کام کر رہے ہیں"
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Google Cloud API key not configured' });
    }

    const requestBody = {
      input: { text },
      voice: {
        languageCode: 'ur-IN',
        name: 'ur-IN-Standard-A',
        ssmlGender: 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0.0
      },
    };

    const response = await axios.post(
      `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${apiKey}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const audioContent = response.data.audioContent;
    
    res.set({
      'Content-Type': 'audio/mp3',
      'Content-Length': Buffer.from(audioContent, 'base64').length,
    });
    
    res.send(Buffer.from(audioContent, 'base64'));
  } catch (error) {
    console.error('Text-to-Speech Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to convert text to speech',
      details: error.response?.data || error.message
    });
  }
});

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });


// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
}); 