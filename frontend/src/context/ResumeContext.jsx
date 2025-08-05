import React, { createContext, useState } from 'react';
import questions from '../utils/questions';

export const ResumeContext = createContext();

export const ResumeProvider = ({ children }) => {
  const [answers, setAnswers] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  const setAnswer = (step, answer) => {
    setAnswers(prev => {
      const updated = [...prev];
      updated[step] = answer;
      return updated;
    });
  };

  const resetAnswers = () => {
    setAnswers([]);
    setCurrentStep(0);
  };

  return (
    <ResumeContext.Provider value={{ answers, setAnswer, currentStep, setCurrentStep, resetAnswers }}>
      {children}
    </ResumeContext.Provider>
  );
};
