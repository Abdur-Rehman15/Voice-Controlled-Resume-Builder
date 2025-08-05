import React, { useState, useEffect, useRef } from 'react';
import MicButton from './MicButton';
import useSpeech from '../hooks/useSpeech';
import useTTS from '../hooks/useTTS';

const QuestionStep = ({ question, onAnswer, showConfirm, pendingAnswer, extractedInfo, onConfirm, isStarted, currentStep }) => {
  const [input, setInput] = useState('');
  const [questionPlayed, setQuestionPlayed] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [validating, setValidating] = useState(false);
  const [localExtractedInfo, setLocalExtractedInfo] = useState('');
  const questionRef = useRef(null);
  
  // Map question types based on index
  const getQuestionType = (step) => {
    const questionTypes = ['name', 'education', 'skills', 'experience', 'contact'];
    return questionTypes[step] || 'name';
  };
  
  const { startListening, listening } = useSpeech({
    onResult: async (result) => {
      setInput(result);
      setIsListening(false);
      setValidating(true);
      
      try {
        // Validate answer with backend
        const response = await fetch('http://localhost:5000/api/validate-answer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questionType: getQuestionType(currentStep),
            answer: result
          })
        });
        
        const validationResult = await response.json();
        console.log('Validation result:', validationResult);
        
        if (validationResult.valid) {
          // Store the extracted information
          const extracted = validationResult.extractedInfo || result;
          setLocalExtractedInfo(extracted);
          // Pass both raw input and extracted info to parent
          setTimeout(() => {
            onAnswer(result, extracted);
          }, 500);
        } else {
          // If invalid, show error and restart listening
          alert(validationResult.message || 'جواب درست نہیں ہے، دوبارہ کوشش کریں');
          setTimeout(() => {
            setIsListening(true);
            startListening();
          }, 2000);
        }
      } catch (error) {
        console.error('Validation error:', error);
        // If validation fails, still proceed with answer
        setLocalExtractedInfo(result);
        setTimeout(() => {
          onAnswer(result, result);
        }, 500);
      } finally {
        setValidating(false);
      }
    }
  });
  
  const { speak, speaking } = useTTS();

  // Auto-play question when component mounts or question changes
  useEffect(() => {
    if (isStarted && !questionPlayed) {
      setTimeout(() => {
        speak(question);
        setQuestionPlayed(true);
      }, 1000);
    }
  }, [isStarted, question, questionPlayed, speak]);

  // Auto-enable mic after question ends
  useEffect(() => {
    if (questionPlayed && !speaking && !isListening && !showConfirm && !validating) {
      setTimeout(() => {
        setIsListening(true);
        startListening();
      }, 1000);
    }
  }, [questionPlayed, speaking, isListening, showConfirm, validating, startListening]);

  // Reset for new question
  useEffect(() => {
    setQuestionPlayed(false);
    setInput('');
    setIsListening(false);
    setValidating(false);
    setLocalExtractedInfo('');
  }, [question]);

  // Use the extracted info from props or local state
  const displayExtractedInfo = extractedInfo || localExtractedInfo;

  return (
    <div style={{ margin: 20, padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <div style={{ marginBottom: 10 }}>
        <b>سوال:</b> {question}
        {speaking && (
          <div style={{ color: 'blue', marginTop: 5 }}>
            سوال پلے ہو رہا ہے...
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: 10 }}>
        {isListening && (
          <div style={{ color: 'red', marginBottom: 10 }}>
            مائیکروفون فعال ہے - اپنا جواب بولیں
          </div>
        )}
        {validating && (
          <div style={{ color: 'orange', marginBottom: 10 }}>
            جواب کی تصدیق ہو رہی ہے...
          </div>
        )}
        <MicButton onClick={() => {}} listening={listening} disabled={true} />
        <span style={{ marginLeft: 10 }}>
          {input || 'جواب سن رہا ہے...'}
        </span>
      </div>
      
      {showConfirm && (
        <div style={{ 
          position: 'fixed', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '20px',
          border: '2px solid #ccc',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          zIndex: 1000
        }}>
          <div style={{ marginBottom: 15, textAlign: 'center' }}>
            <b>کیا آپ کا جواب یہ ہے؟</b>
            <br />
            <span style={{ color: 'blue', fontSize: '16px', fontWeight: 'bold' }}>
              {displayExtractedInfo || pendingAnswer}
            </span>
            {displayExtractedInfo && displayExtractedInfo !== pendingAnswer && (
              <div style={{ marginTop: 10, fontSize: '12px', color: '#666' }}>
                <i>آپ نے کہا: "{pendingAnswer}"</i>
              </div>
            )}
          </div>
          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={() => onConfirm(true)}
              style={{
                marginRight: 10,
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              ہاں
            </button>
            <button 
              onClick={() => onConfirm(false)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              نہیں
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionStep;
