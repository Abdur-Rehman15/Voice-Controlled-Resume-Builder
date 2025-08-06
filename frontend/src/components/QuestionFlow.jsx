import React, { useContext, useState, useEffect } from 'react';
import { ResumeContext } from '../context/ResumeContext';
import QuestionStep from './QuestionStep';
import questions from '../utils/questions';

const QuestionFlow = () => {
  const { answers, setAnswer, currentStep, setCurrentStep, resetAnswers } = useContext(ResumeContext);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAnswer, setPendingAnswer] = useState('');
  const [extractedInfo, setExtractedInfo] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [generatingResume, setGeneratingResume] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(null);

  const handleStart = () => {
    console.log('[QuestionFlow] User started the question flow');
    setIsStarted(true);
  };

  const handleAnswer = (answer, extracted) => {
    console.log(`[QuestionFlow] Answer received for step ${currentStep}:`);
    console.log(`  - Raw answer: "${answer}"`);
    console.log(`  - Extracted info: "${extracted}"`);
    console.log(`  - Current question: "${questions[currentStep]}"`);
    
    setPendingAnswer(answer);
    setExtractedInfo(extracted);
    setShowConfirm(true);
  };

  const generateResume = async () => {
    console.log('[QuestionFlow] Starting resume generation');
    console.log('[QuestionFlow] Final answers:', answers);
    
    setGeneratingResume(true);
    try {
      const response = await fetch('http://localhost:5000/api/generate-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers })
      });

      if (!response.ok) {
        throw new Error('Failed to generate resume');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResumeUrl(url);
      console.log('[QuestionFlow] Resume generated successfully');
    } catch (error) {
      console.error('[QuestionFlow] Resume generation error:', error);
      alert('ریزیوم بنانے میں مسئلہ ہوا ہے');
    } finally {
      setGeneratingResume(false);
    }
  };

  const handleConfirm = (confirmed) => {
    if (confirmed) {
      // Use the extracted information instead of raw input
      const finalAnswer = extractedInfo || pendingAnswer;
      console.log(`[QuestionFlow] User confirmed answer for step ${currentStep}: "${finalAnswer}"`);
      
      setAnswer(currentStep, finalAnswer);
      setShowConfirm(false);
      setPendingAnswer('');
      setExtractedInfo('');
      
      if (currentStep < questions.length - 1) {
        console.log(`[QuestionFlow] Moving to next step: ${currentStep + 1}`);
        setCurrentStep(currentStep + 1);
      } else {
        // All questions completed - generate resume
        console.log('[QuestionFlow] All questions completed, generating resume');
        generateResume();
      }
    } else {
      console.log(`[QuestionFlow] User rejected answer for step ${currentStep}`);
      setShowConfirm(false);
      setPendingAnswer('');
      setExtractedInfo('');
    }
  };

  const handleRestart = () => {
    console.log('[QuestionFlow] User restarted the flow');
    resetAnswers();
    setIsStarted(false);
    setResumeUrl(null);
  };

  // Log when current step changes
  useEffect(() => {
    console.log(`[QuestionFlow] Current step changed to: ${currentStep}`);
    console.log(`[QuestionFlow] Current question: "${questions[currentStep]}"`);
  }, [currentStep]);

  if (!isStarted) {
    return (
      <div style={{ textAlign: 'center', marginTop: 50 }}>
        <button 
          onClick={handleStart}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          شروع کریں
        </button>
      </div>
    );
  }

  if (generatingResume) {
    return (
      <div style={{ textAlign: 'center', marginTop: 50 }}>
        <div style={{ fontSize: '18px', marginBottom: 20 }}>
          آپ کا ریزیوم تیار ہو رہا ہے...
        </div>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #4CAF50',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (resumeUrl) {
    return (
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <h2>آپ کا ریزیوم تیار ہے!</h2>
        <div style={{ marginBottom: 20 }}>
          <button 
            onClick={() => window.open(resumeUrl, '_blank')}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: 10
            }}
          >
            ریزیوم دیکھیں
          </button>
          <a 
            href={resumeUrl} 
            download="resume.pdf"
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            ڈاؤن لوڈ کریں
          </a>
        </div>
        <button 
          onClick={handleRestart}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          دوبارہ شروع کریں
        </button>
      </div>
    );
  }

  return (
    <div>
      <QuestionStep
        question={questions[currentStep]}
        onAnswer={handleAnswer}
        showConfirm={showConfirm}
        pendingAnswer={pendingAnswer}
        extractedInfo={extractedInfo}
        onConfirm={handleConfirm}
        isStarted={isStarted}
        currentStep={currentStep}
      />
    </div>
  );
};

export default QuestionFlow;
