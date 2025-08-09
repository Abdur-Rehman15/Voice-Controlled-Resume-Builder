import pdfGenerator from '../utils/pdfGenerator.js';
import Resume from '../models/Resume.js';
import geminiClient from '../utils/geminiClient.js';

export const generateResume = async (req, res) => {
  const { answers } = req.body;
  const { sessionId } = req;

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ success: false, message: 'Invalid answers' });
  }

  if (!sessionId) {
    return res.status(400).json({ success: false, message: 'Session ID required' });
  }

  try {
    console.log(`[generateResume] Generating resume for session: ${sessionId}`);

    // Generate PDF
    const pdfBuffer = await pdfGenerator(answers);

    // Translate answers to English for storage
    const translatedAnswers = [];
    for (let i = 0; i < answers.length; i++) {
      if (answers[i]) {
        try {
          const english = await geminiClient.translateToEnglish(answers[i]);
          translatedAnswers[i] = english;
        } catch (e) {
          translatedAnswers[i] = answers[i];
        }
      } else {
        translatedAnswers[i] = '';
      }
    }

    // Generate additional content for storage
    let professionalSummary = '';
    let additionalSkills = '';
    let experienceLearnings = '';

    try {
      professionalSummary = await geminiClient.generateProfessionalSummary(answers);
    } catch (error) {
      professionalSummary = `${answers[1] || 'Professional'} with experience in ${answers[3] || 'various skills'}. ${answers[4] ? 'Has relevant work experience.' : 'Ready to contribute to organizational success.'}`;
    }

    if (translatedAnswers[1] && translatedAnswers[3]) {
      try {
        additionalSkills = await geminiClient.generateAdditionalSkills(translatedAnswers[1], translatedAnswers[3]);
      } catch (error) {
        console.error('Error generating additional skills:', error);
      }
    }

    if (translatedAnswers[4] && translatedAnswers[1]) {
      try {
        experienceLearnings = await geminiClient.generateExperienceLearnings(translatedAnswers[4], translatedAnswers[1]);
      } catch (error) {
        console.error('Error generating experience learnings:', error);
      }
    }

    // Save to database
    const resume = new Resume({
      sessionId: sessionId,
      answers: answers,
      translatedAnswers: translatedAnswers,
      professionalSummary: professionalSummary,
      additionalSkills: additionalSkills,
      experienceLearnings: experienceLearnings,
      pdfBuffer: pdfBuffer
    });

    await resume.save();
    console.log(`[generateResume] Resume saved to database for session: ${sessionId}`);

    // Send PDF response
    res.set({ 
      'Content-Type': 'application/pdf',
      'X-Session-ID': sessionId
    });
    res.send(pdfBuffer);

  } catch (err) {
    console.error('[generateResume] Error:', err);
    res.status(500).json({ success: false, message: 'Resume generation failed', error: err.message });
  }
};
