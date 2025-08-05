import React from 'react';
import { ResumeProvider } from '../context/ResumeContext';
import QuestionFlow from '../components/QuestionFlow';

const CreateCV = () => (
  <ResumeProvider>
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <h2 style={{ textAlign: 'center' }}>آسان سی وی بنانے کا عمل</h2>
      <QuestionFlow />
    </div>
  </ResumeProvider>
);

export default CreateCV;
