import React, { useState, useEffect } from 'react';
import MicButton from './MicButton';
import useSpeech from '../hooks/useSpeech';
import useTTS from '../hooks/useTTS';

// Loading Animation Component
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <style jsx>{`
      .loading-spinner {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 20px 0;
      }
      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #4CAF50;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Sound Wave Animation Component
const SoundWaveAnimation = () => (
  <div className="sound-wave">
    <div className="wave"></div>
    <div className="wave"></div>
    <div className="wave"></div>
    <div className="wave"></div>
    <div className="wave"></div>
    <style jsx>{`
      .sound-wave {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 3px;
        margin: 0 10px;
      }
      .wave {
        width: 4px;
        height: 20px;
        background: linear-gradient(to top, #ff4444, #ff6666);
        border-radius: 2px;
        animation: wave 1.2s ease-in-out infinite;
      }
      .wave:nth-child(1) { animation-delay: 0s; }
      .wave:nth-child(2) { animation-delay: 0.1s; }
      .wave:nth-child(3) { animation-delay: 0.2s; }
      .wave:nth-child(4) { animation-delay: 0.3s; }
      .wave:nth-child(5) { animation-delay: 0.4s; }
      @keyframes wave {
        0%, 100% { 
          height: 10px;
          background: linear-gradient(to top, #ff4444, #ff6666);
        }
        50% { 
          height: 30px;
          background: linear-gradient(to top, #ff2222, #ff4444);
        }
      }
    `}</style>
  </div>
);

// Enhanced Popup Component
const EnhancedPopup = ({ show, children, onClose }) => {
  if (!show) return null;
  
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        {children}
        <style jsx>{`
          .popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            backdrop-filter: blur(5px);
            animation: fadeIn 0.3s ease-out;
          }
          .popup-content {
            background: white;
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 90vw;
            max-height: 90vh;
            animation: slideIn 0.3s ease-out;
            border: 2px solid #e0e0e0;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideIn {
            from { 
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.9);
            }
            to { 
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

const QuestionStep = ({ question, onAnswer, showConfirm, pendingAnswer, extractedInfo, onConfirm, isStarted, currentStep }) => {
  const [input, setInput] = useState('');
  const [questionPlayed, setQuestionPlayed] = useState(false);
  const [validating, setValidating] = useState(false);
  const [localExtractedInfo, setLocalExtractedInfo] = useState('');
  const [micEnabled, setMicEnabled] = useState(false);
  const [error, setError] = useState('');
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  const { startListening, listening, stopListening } = useSpeech({
    onResult: async (result) => {
      console.log(`[QuestionStep] Speech recognition result: "${result}"`);
      setInput(result);
      setValidating(true);
      setError('');

      if (!result || result.trim() === '') {
        console.log('[QuestionStep] Empty speech result, showing error without validation');
        setError('کوئی جواب نہیں ملا، دوبارہ کوشش کریں');
        setValidating(false);
        return;
      }

      try {
        const questionTypes = ['name', 'profession', 'education', 'skills', 'experience', 'certifications', 'address', 'contact'];
        const questionType = questionTypes[currentStep] || 'name';

        const response = await fetch('http://localhost:5000/api/validate-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionType,
            answer: result,
            questionText: question,
            stepIndex: currentStep
          })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const validationResult = await response.json();
        console.log(`[QuestionStep] Validation result for step ${currentStep}:`, validationResult);

        if (validationResult.valid) {
          const extracted = validationResult.extractedInfo || result;
          setLocalExtractedInfo(extracted);
          setError('');
          setTimeout(() => onAnswer(result, extracted), 300);
        } else {
          setError(validationResult.message || 'جواب درست نہیں ہے، دوبارہ کوشش کریں');
        }
      } catch (e) {
        console.error('[QuestionStep] Validation error:', e);
        setError('سرور سے جواب نہیں آیا یا مسئلہ ہوا ہے، دوبارہ کوشش کریں');
        setLocalExtractedInfo(result);
        setTimeout(() => onAnswer(result, result), 300);
      } finally {
        setValidating(false);
      }
    }
  });

  const { speak, speaking } = useTTS();

  // Play question once when step changes - FIXED to avoid infinite loop
  useEffect(() => {
    if (!isStarted) return;
    console.log(`[QuestionStep] Starting new question: "${question}"`);
    setQuestionPlayed(false);
    setMicEnabled(false);
    setInput('');
    setLocalExtractedInfo('');
    setError('');
    setTextInput('');

    const isLastQuestion = currentStep === 7;
    setShowTextInput(isLastQuestion);

    const t = setTimeout(() => {
      console.log(`[QuestionStep] Playing question: "${question}"`);
      speak(question);
      setQuestionPlayed(true);
    }, 200);

    return () => {
      clearTimeout(t);
    };
  }, [currentStep, isStarted, question]); // Removed 'speak' to prevent infinite loop

  // Enable mic after TTS done and not validating
  useEffect(() => {
    if (questionPlayed && !speaking && !listening && !showConfirm && !validating) {
      setMicEnabled(true);
    } else {
      setMicEnabled(false);
    }
  }, [questionPlayed, speaking, listening, showConfirm, validating]);

  const handleMicClick = () => {
    if (!micEnabled || listening) return;
    console.log('[QuestionStep] Manual mic button clicked, starting listening');
    setError('');
    startListening();
  };

  const handleTextInputSubmit = async (e) => {
    e.preventDefault();
    if (!textInput.trim()) {
      setError('براہ کرم فون نمبر درج کریں');
      return;
    }

    try {
      setValidating(true);
      setError('');
      const response = await fetch('http://localhost:5000/api/validate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionType: 'contact',
          answer: textInput,
          questionText: question,
          stepIndex: currentStep
        })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const validationResult = await response.json();
      if (validationResult.valid) {
        const extracted = validationResult.extractedInfo || textInput;
        setLocalExtractedInfo(extracted);
        setTimeout(() => onAnswer(textInput, extracted), 300);
      } else {
        setError(validationResult.message || 'فون نمبر درست نہیں ہے، دوبارہ کوشش کریں');
      }
    } catch (e) {
      console.error('[QuestionStep] Text input validation error:', e);
      setError('سرور سے جواب نہیں آیا یا مسئلہ ہوا ہے، دوبارہ کوشش کریں');
      setLocalExtractedInfo(textInput);
      setTimeout(() => onAnswer(textInput, textInput), 300);
    } finally {
      setValidating(false);
    }
  };

  const displayExtractedInfo = extractedInfo || localExtractedInfo;

  return (
    <>
      {/* Enhanced Question Container */}
      <div className="question-container">
        <div className="question-header">
          <div className="question-number">سوال {currentStep + 1}</div>
          <div className="question-text">
            <span className="question-label">سوال:</span> {question}
          </div>
          {speaking && (
            <div className="tts-indicator">
              <div className="pulse"></div>
              <span>سوال پلے ہو رہا ہے...</span>
            </div>
          )}
        </div>

        <div className="answer-section">
          {/* Listening Status with Sound Waves */}
          {listening && (
            <div className="listening-status">
              <div className="mic-icon">🎤</div>
              <SoundWaveAnimation />
              <span>مائیکروفون فعال ہے - اپنا جواب بولیں</span>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="error-container">
              <div className="error-icon">⚠️</div>
              <div className="error-content">
                <div className="error-message">{error}</div>
                {!showTextInput && (
                  <button onClick={() => { setError(''); startListening(); }} className="retry-button">
                    🔄 دوبارہ کوشش کریں
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Ready to Speak Status */}
          {!speaking && !validating && micEnabled && !showTextInput && (
            <div className="ready-status">
              <div className="ready-icon">✅</div>
              <span>مائیکروفون کو دبانے کے لیے تیار ہے</span>
              <button onClick={() => { setQuestionPlayed(false); setTimeout(() => { speak(question); setQuestionPlayed(true); }, 250); }}
                className="replay-button">
                🔁 سوال دوبارہ سنیں
              </button>
            </div>
          )}

          {/* Text Input for Last Question */}
          {showTextInput && (
            <div className="text-input-container">
              <div className="text-input-header">
                <span className="text-input-icon">📝</span>
                <span>فون نمبر کے لیے ٹیکسٹ باکس استعمال کریں</span>
              </div>
              <form onSubmit={handleTextInputSubmit} className="text-input-form">
                <input 
                  type="text" 
                  value={textInput} 
                  onChange={(e) => setTextInput(e.target.value)} 
                  placeholder="فون نمبر درج کریں (مثال: 03001234567)"
                  className="text-input-field"
                />
                <button type="submit" disabled={validating} className="text-submit-button">
                  {validating ? '⏳ تصدیق ہو رہی ہے...' : '✅ جمع کریں'}
                </button>
              </form>
            </div>
          )}

          {/* Mic Button and Status */}
          <div className="mic-section">
            {!showTextInput && (
              <MicButton onClick={handleMicClick} listening={listening} disabled={!micEnabled || validating || listening} />
            )}
            <span className="mic-status">
              {input || (micEnabled && !showTextInput ? 'مائیکروفون کو دبائیں' : 'جواب سن رہا ہے...')}
            </span>
          </div>
        </div>

        <style jsx>{`
          .question-container {
            margin: 20px auto;
            max-width: 800px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            color: white;
          }
          .question-header {
            margin-bottom: 25px;
          }
          .question-number {
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 20px;
            display: inline-block;
            font-weight: bold;
            margin-bottom: 15px;
            backdrop-filter: blur(10px);
          }
          .question-text {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .question-label {
            color: rgba(255, 255, 255, 0.8);
            font-size: 18px;
          }
          .tts-indicator {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 15px;
            padding: 10px;
            background: rgba(33, 150, 243, 0.3);
            border-radius: 10px;
            backdrop-filter: blur(10px);
          }
          .pulse {
            width: 12px;
            height: 12px;
            background: #2196F3;
            border-radius: 50%;
            animation: pulse 1.5s ease-in-out infinite;
          }
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.3); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
          .answer-section {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px;
            backdrop-filter: blur(10px);
          }
          .listening-status {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            background: linear-gradient(45deg, #ff4444, #ff6666);
            border-radius: 15px;
            margin-bottom: 15px;
            box-shadow: 0 5px 15px rgba(255, 68, 68, 0.3);
            animation: pulse-border 2s ease-in-out infinite;
          }
          @keyframes pulse-border {
            0% { box-shadow: 0 5px 15px rgba(255, 68, 68, 0.3); }
            50% { box-shadow: 0 5px 25px rgba(255, 68, 68, 0.6); }
            100% { box-shadow: 0 5px 15px rgba(255, 68, 68, 0.3); }
          }
          .mic-icon {
            font-size: 24px;
            animation: bounce 2s ease-in-out infinite;
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          .error-container {
            display: flex;
            gap: 15px;
            padding: 15px;
            background: linear-gradient(45deg, #f44336, #e57373);
            border-radius: 15px;
            margin-bottom: 15px;
            box-shadow: 0 5px 15px rgba(244, 67, 54, 0.3);
          }
          .error-icon {
            font-size: 24px;
          }
          .error-content {
            flex: 1;
          }
          .error-message {
            margin-bottom: 10px;
            font-weight: bold;
          }
          .retry-button {
            padding: 8px 16px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
          }
          .retry-button:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
          }
          .ready-status {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            background: linear-gradient(45deg, #4CAF50, #81C784);
            border-radius: 15px;
            margin-bottom: 15px;
            box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
          }
          .ready-icon {
            font-size: 24px;
          }
          .replay-button {
            padding: 6px 12px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
            margin-left: auto;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
          }
          .replay-button:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
          }
          .text-input-container {
            background: linear-gradient(45deg, #2196F3, #64B5F6);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 15px;
            box-shadow: 0 5px 15px rgba(33, 150, 243, 0.3);
          }
          .text-input-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
            font-weight: bold;
          }
          .text-input-icon {
            font-size: 20px;
          }
          .text-input-form {
            display: flex;
            flex-direction: column;
            gap: 15px;
          }
          .text-input-field {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
          }
          .text-input-field:focus {
            outline: none;
            box-shadow: 0 4px 20px rgba(33, 150, 243, 0.3);
            transform: translateY(-2px);
          }
          .text-submit-button {
            padding: 12px 24px;
            background: linear-gradient(45deg, #4CAF50, #81C784);
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-weight: bold;
            font-size: 16px;
            transition: all 0.3s ease;
          }
          .text-submit-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
          }
          .text-submit-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
          .mic-section {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            backdrop-filter: blur(10px);
          }
          .mic-status {
            font-size: 16px;
            font-weight: 500;
          }
        `}</style>
      </div>

      {/* Enhanced Validation Popup */}
      <EnhancedPopup show={validating}>
        <div className="validation-popup">
          <h2 className="validation-title">انتظار کریں</h2>
          <LoadingSpinner />
          <p className="validation-message">آپ کے جواب کی تصدیق ہو رہی ہے...</p>
          <style jsx>{`
            .validation-popup {
              text-align: center;
              padding: 20px;
            }
            .validation-title {
              color: #333;
              margin-bottom: 20px;
              font-size: 28px;
              font-weight: bold;
            }
            .validation-message {
              color: #666;
              font-size: 16px;
              margin-top: 15px;
            }
          `}</style>
        </div>
      </EnhancedPopup>

      {/* Enhanced Confirmation Popup */}
      <EnhancedPopup show={showConfirm && !validating}>
        <div className="confirmation-popup">
          <div className="confirmation-header">
            <h3>کیا آپ کا جواب یہ ہے؟</h3>
          </div>
          <div className="answer-display">
            <div className="extracted-answer">
              {displayExtractedInfo || pendingAnswer}
            </div>
          </div>
          <div className="confirmation-buttons">
            <button onClick={() => onConfirm(true)} className="confirm-yes">
              ✅ ہاں
            </button>
            <button onClick={() => { onConfirm(false); setInput(''); setLocalExtractedInfo(''); setError(''); if (listening) stopListening(); }} className="confirm-no">
              ❌ نہیں
            </button>
          </div>
          <style jsx>{`
            .confirmation-popup {
              text-align: center;
              min-width: 400px;
            }
            .confirmation-header h3 {
              color: #333;
              margin-bottom: 25px;
              font-size: 24px;
              font-weight: bold;
            }
            .answer-display {
              margin-bottom: 30px;
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 15px;
              color: white;
            }
            .extracted-answer {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .original-answer {
              font-size: 14px;
              opacity: 0.8;
            }
            .confirmation-buttons {
              display: flex;
              gap: 20px;
              justify-content: center;
            }
            .confirm-yes {
              padding: 15px 30px;
              background: linear-gradient(45deg, #4CAF50, #81C784);
              color: white;
              border: none;
              border-radius: 10px;
              cursor: pointer;
              font-size: 18px;
              font-weight: bold;
              transition: all 0.3s ease;
              box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
            }
            .confirm-yes:hover {
              transform: translateY(-3px);
              box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
            }
            .confirm-no {
              padding: 15px 30px;
              background: linear-gradient(45deg, #f44336, #e57373);
              color: white;
              border: none;
              border-radius: 10px;
              cursor: pointer;
              font-size: 18px;
              font-weight: bold;
              transition: all 0.3s ease;
              box-shadow: 0 5px 15px rgba(244, 67, 54, 0.3);
            }
            .confirm-no:hover {
              transform: translateY(-3px);
              box-shadow: 0 8px 25px rgba(244, 67, 54, 0.4);
            }
          `}</style>
        </div>
      </EnhancedPopup>
    </>
  );
};

export default QuestionStep;
