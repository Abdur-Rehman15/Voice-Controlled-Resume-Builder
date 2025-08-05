import React, { useContext, useState } from 'react';
import { ResumeContext } from '../context/ResumeContext';
import QuestionStep from './QuestionStep';
import questions from '../utils/questions';

const QuestionFlow = () => {
  const { answers, setAnswer, currentStep, setCurrentStep, resetAnswers } = useContext(ResumeContext);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAnswer, setPendingAnswer] = useState('');

  const handleAnswer = (answer) => {
    setPendingAnswer(answer);
    setShowConfirm(true);
  };

  const handleConfirm = (confirmed) => {
    if (confirmed) {
      setAnswer(currentStep, pendingAnswer);
      setShowConfirm(false);
      setPendingAnswer('');
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      setShowConfirm(false);
      setPendingAnswer('');
    }
  };

  return (
    <div>
      <QuestionStep
        question={questions[currentStep]}
        onAnswer={handleAnswer}
        showConfirm={showConfirm}
        pendingAnswer={pendingAnswer}
        onConfirm={handleConfirm}
      />
      {/* Optionally, add a reset button */}
      <button onClick={resetAnswers} style={{marginTop: 20}}>جوابات ری سیٹ کریں</button>
    </div>
  );
};

export default QuestionFlow;
