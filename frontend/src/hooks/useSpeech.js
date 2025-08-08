// hooks/useSpeech.js - COMPREHENSIVE DEBUG VERSION
import { useState, useEffect, useRef } from 'react';

const useSpeech = ({ onResult }) => {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);
  const restartTimerRef = useRef(null);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    console.log('[useSpeech] Initializing speech recognition...');
    
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('[useSpeech] Speech Recognition API not supported in this browser');
      console.log('[useSpeech] Browser info:', {
        userAgent: navigator.userAgent,
        webkitSpeechRecognition: !!window.webkitSpeechRecognition,
        SpeechRecognition: !!window.SpeechRecognition,
        isHTTPS: location.protocol === 'https:',
        isLocalhost: location.hostname === 'localhost' || location.hostname === '127.0.0.1'
      });
      return;
    }

    console.log('[useSpeech] Speech Recognition API available');
    
    const recognition = new SpeechRecognition();
    
    // Configure recognition
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'ur-PK';
    recognition.maxAlternatives = 1;
    
    console.log('[useSpeech] Recognition configured:', {
      continuous: recognition.continuous,
      interimResults: recognition.interimResults,
      lang: recognition.lang,
      maxAlternatives: recognition.maxAlternatives
    });

    recognition.onstart = () => {
      console.log('[useSpeech] ✅ Recognition started successfully');
      setListening(true);
    };

    recognition.onspeechstart = () => {
      console.log('[useSpeech] 🎤 Speech detected');
    };

    recognition.onspeechend = () => {
      console.log('[useSpeech] 🔇 Speech ended, stopping recognition');
      try { 
        recognition.stop(); 
      } catch (e) {
        console.warn('[useSpeech] Error stopping on speech end:', e);
      }
    };

    recognition.onsoundstart = () => {
      console.log('[useSpeech] 🔊 Sound detected');
    };

    recognition.onsoundend = () => {
      console.log('[useSpeech] 🔇 Sound ended');
    };

    recognition.onaudiostart = () => {
      console.log('[useSpeech] 🎵 Audio capture started');
    };

    recognition.onaudioend = () => {
      console.log('[useSpeech] 🎵 Audio capture ended');
    };

    recognition.onresult = (event) => {
      console.log('[useSpeech] 📝 Recognition result received:', event);
      console.log('[useSpeech] Results length:', event.results.length);
      
      let transcript = '';
      if (event.results && event.results.length > 0) {
        const result = event.results[0];
        console.log('[useSpeech] First result:', result);
        console.log('[useSpeech] Is final:', result.isFinal);
        console.log('[useSpeech] Confidence:', result[0].confidence);
        
        transcript = result[0].transcript || '';
        console.log('[useSpeech] Raw transcript:', `"${transcript}"`);
      }
      
      setListening(false);
      const trimmed = (transcript || '').trim();
      console.log('[useSpeech] Trimmed transcript:', `"${trimmed}"`);
      
      if (trimmed.length > 0) {
        console.log('[useSpeech] ✅ Calling onResult with:', trimmed);
        onResultRef.current(trimmed);
      } else {
        console.log('[useSpeech] ❌ Empty transcript; not calling onResult');
      }
    };

    recognition.onerror = (event) => {
      console.error('[useSpeech] ❌ Recognition error:', event.error);
      console.error('[useSpeech] Error details:', {
        error: event.error,
        message: event.message,
        type: event.type,
        timeStamp: event.timeStamp
      });
      
      setListening(false);
      
      switch (event.error) {
        case 'not-allowed':
          console.error('[useSpeech] Microphone permission denied');
          alert('مائیکروفون کی اجازت نہیں ملی ہے۔ براہ کرم مائیکروفون کی اجازت دیں۔');
          break;
        case 'no-speech':
          console.warn('[useSpeech] No speech detected');
          break;
        case 'audio-capture':
          console.error('[useSpeech] Audio capture failed');
          break;
        case 'network':
          console.error('[useSpeech] Network error');
          break;
        case 'service-not-allowed':
          console.error('[useSpeech] Service not allowed');
          break;
        case 'bad-grammar':
          console.error('[useSpeech] Bad grammar');
          break;
        case 'language-not-supported':
          console.error('[useSpeech] Language not supported');
          break;
        default:
          console.error('[useSpeech] Unknown error:', event.error);
      }
    };

    recognition.onend = () => {
      console.log('[useSpeech] 🔚 Recognition ended');
      setListening(false);
    };

    recognitionRef.current = recognition;
    console.log('[useSpeech] Recognition setup complete');

    return () => {
      console.log('[useSpeech] Cleanup: stopping recognition');
      try { recognition.stop(); } catch (e) { console.warn('Cleanup stop error:', e); }
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
        console.log('[useSpeech] Cleanup: cleared restart timer');
      }
    };
  }, []);

  const startListening = () => {
    console.log('[useSpeech] 🚀 startListening called');
    
    if (!recognitionRef.current) {
      console.error('[useSpeech] ❌ No recognition instance available');
      return;
    }

    // Check microphone permissions
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' }).then(result => {
        console.log('[useSpeech] Microphone permission:', result.state);
      }).catch(e => {
        console.warn('[useSpeech] Could not check microphone permission:', e);
      });
    }

    // If currently listening, restart
    if (listening) {
      console.log('[useSpeech] Already listening; restarting...');
      stopListening();
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      restartTimerRef.current = setTimeout(() => {
        console.log('[useSpeech] Executing delayed restart');
        startListening();
      }, 300);
      return;
    }

    console.log('[useSpeech] Attempting to start recognition...');
    try {
      recognitionRef.current.start();
      console.log('[useSpeech] ✅ recognition.start() called successfully');
    } catch (error) {
      console.error('[useSpeech] ❌ Error calling recognition.start():', error);
      console.error('[useSpeech] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      setListening(false);
      
      // Attempt recovery
      console.log('[useSpeech] Attempting recovery...');
      stopListening();
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      restartTimerRef.current = setTimeout(() => {
        console.log('[useSpeech] Recovery attempt: trying to start again');
        try { 
          recognitionRef.current && recognitionRef.current.start(); 
          console.log('[useSpeech] Recovery start successful');
        } catch (e) { 
          console.error('[useSpeech] Recovery failed:', e);
        }
      }, 500);
    }
  };

  const stopListening = () => {
    console.log('[useSpeech] 🛑 stopListening called');
    
    if (!recognitionRef.current) {
      console.warn('[useSpeech] No recognition instance to stop');
      return;
    }
    
    try { 
      recognitionRef.current.abort(); 
      console.log('[useSpeech] abort() called');
    } catch (e) {
      console.warn('[useSpeech] Error calling abort():', e);
    }
    
    try { 
      recognitionRef.current.stop(); 
      console.log('[useSpeech] stop() called');
    } catch (e) {
      console.warn('[useSpeech] Error calling stop():', e);
    }
    
    setListening(false);
  };

  const forceCleanup = () => {
    console.log('[useSpeech] 🧹 Force cleanup called');
    stopListening();
  };

  return { startListening, stopListening, listening, forceCleanup };
};

export default useSpeech;