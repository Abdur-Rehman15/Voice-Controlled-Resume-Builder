import React, { useState, useRef } from 'react';
import { Box, Button, Typography, Paper, CircularProgress } from '@mui/material';

const CreateCV = () => {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  const initRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser.');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ur-PK'; // Changed to English Indian
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
    };

    recognition.onend = () => {
      setListening(false);
      // Automatically convert to speech when recognition ends
      if (transcript) {
        convertToSpeech(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech Recognition Error:', event.error);
      setListening(false);
    };

    return recognition;
  };

  const startListening = () => {
    const recognition = initRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const convertToSpeech = async (text) => {
    if (!text.trim()) return;

    setIsConverting(true);
    try {
      const response = await fetch('http://localhost:5000/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to convert text to speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create audio element and play
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        alert('Error playing audio');
      };

      audio.play();
    } catch (error) {
      console.error('Text-to-Speech Error:', error);
      alert('Failed to convert text to speech. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  const speakText = () => {
    if (transcript) {
      convertToSpeech(transcript);
    }
  };

  return (
    <Box display="flex" justifyContent="center" mt={5}>
      <Paper elevation={6} sx={{ p: 4, width: '90%', maxWidth: 600 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center">
          🎤 Create CV with Voice
        </Typography>

        <Box display="flex" gap={2} justifyContent="center" mt={2} flexWrap="wrap">
          <Button
            variant="contained"
            color="primary"
            onClick={startListening}
            disabled={listening || isConverting}
            startIcon={listening ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {listening ? 'Listening...' : 'Start Microphone'}
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={stopListening}
            disabled={!listening}
          >
            Stop Microphone
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            onClick={speakText}
            disabled={!transcript || isConverting || isPlaying}
            startIcon={isConverting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isConverting ? 'Converting...' : isPlaying ? 'Playing...' : 'Play Speech'}
          </Button>
        </Box>

        <Typography variant="h6" mt={4} fontWeight="bold" textAlign="left">
          You said:
        </Typography>
        <Typography variant="body1" textAlign="left" sx={{ mt: 1, p: 2, border: '1px solid #ccc', borderRadius: 2, minHeight: '60px' }}>
          {transcript || 'Nothing said yet'}
        </Typography>

        {isConverting && (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress />
            <Typography variant="body2" ml={2}>
              Converting to speech...
            </Typography>
          </Box>
        )}

        {isPlaying && (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress />
            <Typography variant="body2" ml={2}>
              Playing audio...
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CreateCV;
