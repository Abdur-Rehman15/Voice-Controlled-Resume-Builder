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
  const [micEnabled, setMicEnabled] = useState(false);
  const questionRef = useRef(null);
  
  // Map question types based on index - ensure this matches the questions array order
  // Index 0: name, Index 1: profession, Index 2: education, Index 3: skills, Index 4: experience, Index 5: certifications, Index 6: address, Index 7: contact
  const getQuestionType = (step) => {
    const questionTypes = ['name', 'profession', 'education', 'skills', 'experience', 'certifications', 'address', 'contact'];
    const questionType = questionTypes[step] || 'name';
    console.log(`[QuestionStep] Step ${step}: Question type mapped to "${questionType}"`);
    return questionType;
  };
  
  const { startListening, listening, stopListening } = useSpeech({
    onResult: async (result) => {
      console.log(`[QuestionStep] Speech recognition result: "${result}"`);
      setInput(result);
      setIsListening(false);
      setValidating(true);
      
      try {
        const questionType = getQuestionType(currentStep);
        console.log(`[QuestionStep] Sending validation request for questionType: "${questionType}", answer: "${result}"`);
        
        // Validate answer with backend
        const response = await fetch('http://localhost:5000/api/validate-answer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questionType: questionType,
            answer: result
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const validationResult = await response.json();
        console.log(`[QuestionStep] Validation result:`, validationResult);
        
        if (validationResult.valid) {
          // Store the extracted information
          const extracted = validationResult.extractedInfo || result;
          setLocalExtractedInfo(extracted);
          console.log(`[QuestionStep] Answer validated successfully. Extracted info: "${extracted}"`);
          // Pass both raw input and extracted info to parent
          setTimeout(() => {
            onAnswer(result, extracted);
          }, 500);
        } else {
          // If invalid, show error and restart listening
          console.log(`[QuestionStep] Answer validation failed: ${validationResult.message}`);
          alert(validationResult.message || 'جواب درست نہیں ہے، دوبارہ کوشش کریں');
          setTimeout(() => {
            setIsListening(true);
            startListening();
          }, 2000);
        }
      } catch (error) {
        console.error('[QuestionStep] Validation error:', error);
        // If validation fails, still proceed with answer
        console.log('[QuestionStep] Proceeding with answer despite validation error');
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
      console.log(`[QuestionStep] Auto-playing question: "${question}"`);
      setTimeout(() => {
        speak(question);
        setQuestionPlayed(true);
      }, 1000);
    }
  }, [isStarted, question, questionPlayed, speak]);

  // Enable mic button after question ends and TTS is completely finished
  useEffect(() => {
    if (questionPlayed && !speaking && !isListening && !showConfirm && !validating) {
      console.log('[QuestionStep] Question finished, enabling mic button');
      setMicEnabled(true);
    }
  }, [questionPlayed, speaking, isListening, showConfirm, validating]);

  // Handle manual mic button click
  const handleMicClick = () => {
    if (!micEnabled || isListening) return;
    
    console.log('[QuestionStep] Manual mic button clicked, starting listening');
    setIsListening(true);
    setMicEnabled(false);
    startListening();
    
    // Add timeout to prevent hanging
    setTimeout(() => {
      if (isListening && !validating) {
        console.log('[QuestionStep] Speech recognition timeout, stopping...');
        stopListening();
        setIsListening(false);
        setMicEnabled(true);
        alert('مائیکروفون کو دوبارہ دبائیں');
      }
    }, 10000); // 10 second timeout
  };

  // Reset for new question
  useEffect(() => {
    console.log(`[QuestionStep] Resetting for new question: "${question}"`);
    setQuestionPlayed(false);
    setInput('');
    setIsListening(false);
    setValidating(false);
    setLocalExtractedInfo('');
    setMicEnabled(false);
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
        {!speaking && !isListening && !validating && micEnabled && (
          <div style={{ color: 'green', marginBottom: 10 }}>
            مائیکروفون کو دبانے کے لیے تیار ہے
          </div>
        )}
        <MicButton 
          onClick={handleMicClick} 
          listening={listening} 
          disabled={!micEnabled || isListening || validating} 
        />
        <span style={{ marginLeft: 10 }}>
          {input || (micEnabled ? 'مائیکروفون کو دبائیں' : 'جواب سن رہا ہے...')}
        </span>
        
        {/* Fallback text input for manual entry */}
        {micEnabled && !isListening && !validating && (
          <div style={{ marginTop: 10 }}>
            <input
              type="text"
              placeholder="یا یہاں ٹائپ کریں..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                width: '200px',
                marginRight: '10px'
              }}
            />
            <button
              onClick={() => {
                if (input.trim()) {
                  console.log('[QuestionStep] Using manual input:', input);
                  setValidating(true);
                  // Simulate the same flow as speech recognition
                  setTimeout(() => {
                    onAnswer(input, input);
                  }, 500);
                }
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              جمع کریں
            </button>
          </div>
        )}
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
