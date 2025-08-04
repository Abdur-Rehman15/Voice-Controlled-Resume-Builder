# Backend Setup for Google Cloud Text-to-Speech

## Prerequisites

1. **Google Cloud Project**: You need a Google Cloud project with the Text-to-Speech API enabled
2. **API Key**: Get your Google Cloud API key from the Google Cloud Console

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Google Cloud API Key Setup

1. Go to Google Cloud Console
2. Navigate to APIs & Services > Credentials
3. Create an API key or use an existing one
4. Make sure the API key has access to the Text-to-Speech API

### 3. Environment Variables

Create a `.env` file in the backend directory with:
```
GOOGLE_CLOUD_API_KEY=your_api_key_here
MONGODB_URI=mongodb://localhost:27017/asaancv
PORT=5000
```

### 4. Start the Server
```bash
npm run dev
```

## API Endpoints

### POST /api/text-to-speech
Converts text to speech using Google Cloud Text-to-Speech API

**Request Body:**
```json
{
  "text": "Hello, this is a test message"
}
```

**Response:** Audio file (MP3 format)

## Features

- Uses English Indian voice (`en-IN-Standard-A`)
- Returns MP3 audio format
- Supports real-time speech-to-text and text-to-speech conversion 