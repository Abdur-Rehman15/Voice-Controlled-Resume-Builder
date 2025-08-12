import React, { useEffect, useRef, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const Dictaphone = () => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const lastTranscriptRef = useRef('');
  const silenceTimerRef = useRef(null);
  const [hasSpoken, setHasSpoken] = useState(false); // tracks if user has spoken

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  const startListening = () => {
    SpeechRecognition.startListening({
      continuous: true,
      language: 'ur-IN'
    });
    lastTranscriptRef.current = transcript;
    setHasSpoken(false); // reset flag
  };

  useEffect(() => {
    if (listening) {
      // Detect first speech
      if (!hasSpoken && transcript.trim() !== '') {
        setHasSpoken(true);
      }

      // After first speech, track for silence
      if (hasSpoken && transcript !== lastTranscriptRef.current) {
        lastTranscriptRef.current = transcript;

        // Reset existing timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // Start new 2-second timer
        silenceTimerRef.current = setTimeout(() => {
          SpeechRecognition.stopListening();
        }, 5000);
      }
    }

    // Cleanup on unmount
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [transcript, listening, hasSpoken]);

  return (
    <div>
      <p>Microphone: {listening ? 'on' : 'off'}</p>
      <button onClick={startListening}>Start</button>
      <button onClick={SpeechRecognition.stopListening}>Stop</button>
      <button onClick={resetTranscript}>Reset</button>
      <p>{transcript}</p>
    </div>
  );
};

export default Dictaphone;
