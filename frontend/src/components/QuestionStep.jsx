import React, { useState } from 'react';
import MicButton from './MicButton';
import useSpeech from '../hooks/useSpeech';
import useTTS from '../hooks/useTTS';

const QuestionStep = ({ question, onAnswer, showConfirm, pendingAnswer, onConfirm }) => {
  const [input, setInput] = useState('');
  const { startListening, listening } = useSpeech({
    onResult: (result) => setInput(result)
  });
  const { speak, speaking } = useTTS();

  const handlePlay = () => {
    speak(question);
  };

  const handleSubmit = () => {
    onAnswer(input);
  };

  return (
    <div style={{ margin: 20, padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <div style={{ marginBottom: 10 }}>
        <b>سوال:</b> {question}
        <button onClick={handlePlay} disabled={speaking} style={{ marginLeft: 10 }}>
          {speaking ? 'پلے ہو رہا ہے...' : 'سوال سنیں'}
        </button>
      </div>
      <div style={{ marginBottom: 10 }}>
        <MicButton onClick={startListening} listening={listening} />
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="اپنا جواب بولیں یا لکھیں"
          style={{ marginLeft: 10, width: 250 }}
        />
        <button onClick={handleSubmit} disabled={!input || showConfirm} style={{ marginLeft: 10 }}>
          جواب جمع کروائیں
        </button>
      </div>
      {showConfirm && (
        <div style={{ marginTop: 10, background: '#f9f9f9', padding: 10, borderRadius: 6 }}>
          <div>کیا آپ کا جواب یہ ہے؟ <b>{pendingAnswer}</b></div>
          <button onClick={() => onConfirm(true)} style={{ marginRight: 10 }}>ہاں</button>
          <button onClick={() => onConfirm(false)}>نہیں</button>
        </div>
      )}
    </div>
  );
};

export default QuestionStep;
