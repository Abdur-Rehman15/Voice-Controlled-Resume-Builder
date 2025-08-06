import { useRef, useState } from 'react';

const useSpeech = ({ onResult }) => {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);

  const startListening = () => {
    console.log('[useSpeech] Starting speech recognition');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser.');
      return;
    }
    
    // Stop any existing recognition first
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('[useSpeech] Error stopping previous recognition:', e);
      }
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'ur-PK';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => {
      console.log('[useSpeech] Speech recognition started');
      setListening(true);
    };
    
    recognition.onresult = (event) => {
      console.log('[useSpeech] Speech recognition result event:', event);
      if (event.results && event.results.length > 0) {
        const result = event.results[0][0].transcript;
        console.log('[useSpeech] Speech recognition result:', result);
        if (onResult) onResult(result);
      } else {
        console.log('[useSpeech] No results in speech recognition event');
      }
    };
    
    recognition.onend = () => {
      console.log('[useSpeech] Speech recognition ended');
      setListening(false);
    };
    
    recognition.onerror = (event) => {
      console.error('[useSpeech] Speech recognition error:', event.error);
      console.error('[useSpeech] Error details:', event);
      setListening(false);
      
      // Handle specific errors
      if (event.error === 'no-speech') {
        console.log('[useSpeech] No speech detected, restarting...');
        setTimeout(() => {
          if (!listening) {
            startListening();
          }
        }, 1000);
      } else if (event.error === 'network') {
        console.error('[useSpeech] Network error in speech recognition');
      } else if (event.error === 'not-allowed') {
        console.error('[useSpeech] Microphone access not allowed');
        alert('مائیکروفون کی اجازت نہیں ملی ہے۔ براہ کرم مائیکروفون کی اجازت دیں۔');
      }
    };
    
    recognition.onnomatch = () => {
      console.log('[useSpeech] No match found in speech recognition');
      setListening(false);
    };
    
    recognitionRef.current = recognition;
    
    try {
      recognition.start();
      console.log('[useSpeech] Recognition start() called successfully');
    } catch (error) {
      console.error('[useSpeech] Error starting recognition:', error);
      setListening(false);
    }
  };

  const stopListening = () => {
    console.log('[useSpeech] Stopping speech recognition');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('[useSpeech] Error stopping recognition:', error);
      }
    }
  };

  return { startListening, stopListening, listening };
};

export default useSpeech;
