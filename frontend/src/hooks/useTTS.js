import { useState } from 'react';

const TTS_API_URL = 'http://localhost:5000/api/text-to-speech'; // Update as needed

const useTTS = () => {
  const [speaking, setSpeaking] = useState(false);

  const speak = async (text) => {
    if (!text.trim()) return;
    setSpeaking(true);
    try {
      const response = await fetch(TTS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!response.ok) throw new Error('TTS failed');
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.play();
    } catch (e) {
      setSpeaking(false);
      alert('TTS error');
    }
  };

  return { speak, speaking };
};

export default useTTS;
