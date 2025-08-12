import { useEffect, useRef, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const useSpeech = ({ onResult }) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const lastTranscriptRef = useRef('');
  const silenceTimerRef = useRef(null);
  const [hasSpoken, setHasSpoken] = useState(false); // tracks if user has spoken
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  // Check browser support
  if (!browserSupportsSpeechRecognition) {
    console.error('[useSpeech] Browser doesn\'t support speech recognition');
    return {
      startListening: () => console.error('Speech recognition not supported'),
      stopListening: () => {},
      listening: false,
      forceCleanup: () => {},
      browserSupportsSpeechRecognition: false
    };
  }

  const startListening = () => {
    console.log('[useSpeech] 🚀 startListening called');
    
    SpeechRecognition.startListening({
      continuous: true,
      language: 'ur-IN' // Using Urdu language
    });
    
    lastTranscriptRef.current = transcript;
    setHasSpoken(false); // reset flag
    console.log('[useSpeech] ✅ Recognition started successfully');
  };

  const stopListening = () => {
    console.log('[useSpeech] 🛑 stopListening called');
    
    SpeechRecognition.stopListening();
    
    // Clear any existing silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    console.log('[useSpeech] ✅ Recognition stopped');
  };

  const forceCleanup = () => {
    console.log('[useSpeech] 🧹 Force cleanup called');
    stopListening();
    resetTranscript();
    setHasSpoken(false);
  };

  useEffect(() => {
    if (listening) {
      // Detect first speech
      if (!hasSpoken && transcript.trim() !== '') {
        console.log('[useSpeech] 🎤 First speech detected');
        setHasSpoken(true);
      }

      // After first speech, track for silence
      if (hasSpoken && transcript !== lastTranscriptRef.current) {
        console.log('[useSpeech] 📝 New transcript detected:', transcript);
        lastTranscriptRef.current = transcript;

        // Reset existing timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // Start new 5-second timer
        silenceTimerRef.current = setTimeout(() => {
          console.log('[useSpeech] ⏰ 5 seconds of silence detected, stopping recognition');
          SpeechRecognition.stopListening();
          
          // Call onResult with the final transcript
          const finalTranscript = transcript.trim();
          if (finalTranscript.length > 0 && onResultRef.current) {
            console.log('[useSpeech] ✅ Calling onResult with:', finalTranscript);
            onResultRef.current(finalTranscript);
          }
        }, 5000);
      }
    } else {
      // When not listening, clear any existing timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [transcript, listening, hasSpoken]);

  // Handle when recognition ends (either manually or automatically)
  useEffect(() => {
    if (!listening && hasSpoken) {
      // Only call onResult if we had speech and recognition just ended
      const finalTranscript = transcript.trim();
      if (finalTranscript.length > 0 && onResultRef.current) {
        console.log('[useSpeech] ✅ Recognition ended, calling onResult with:', finalTranscript);
        onResultRef.current(finalTranscript);
      }
    }
  }, [listening, hasSpoken, transcript]);

  return {
    startListening,
    stopListening,
    listening,
    forceCleanup,
    browserSupportsSpeechRecognition: true,
    transcript,
    resetTranscript
  };
};

export default useSpeech;