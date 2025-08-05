import pdfGenerator from '../utils/pdfGenerator.js';

export const generateResume = async (req, res) => {
  const { answers } = req.body;
  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ success: false, message: 'Invalid answers' });
  }
  try {
    const pdfBuffer = await pdfGenerator(answers);
    res.set({ 'Content-Type': 'application/pdf' });
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Resume generation failed', error: err.message });
  }
};
