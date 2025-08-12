import PDFDocument from 'pdfkit';
import geminiClient from './geminiClient.js';

const pdfGenerator = async (answers) => {
  console.log('[pdfGenerator] Starting PDF generation with answers:', answers);
  
  // Generate professional summary using Gemini AI
  let professionalSummary;
  try {
    console.log('[pdfGenerator] Generating professional summary...');
    professionalSummary = await geminiClient.generateProfessionalSummary(answers);
    console.log('[pdfGenerator] Professional summary generated:', professionalSummary);
  } catch (error) {
    console.error('[pdfGenerator] Error generating professional summary:', error);
    professionalSummary = `${answers[1] || 'Professional'} with experience in ${answers[3] || 'various skills'}. ${answers[4] ? 'Has relevant work experience.' : 'Ready to contribute to organizational success.'}`;
  }

  // Translate all answers to English using Gemini
  const translatedAnswers = [];
  for (let i = 0; i < answers.length; i++) {
    if (answers[i]) {
      try {
        const english = await geminiClient.translateToEnglish(answers[i]);
        translatedAnswers[i] = english;
        console.log('english: ', english, '\n');
      } catch (e) {
        translatedAnswers[i] = answers[i];
      }
    } else {
      translatedAnswers[i] = '';
    }
  }

  // Generate additional skills using Gemini AI
  let additionalSkills = '';
  if (translatedAnswers[1] && translatedAnswers[3]) {
    try {
      console.log('[pdfGenerator] Generating additional skills...');
      additionalSkills = await geminiClient.generateAdditionalSkills(translatedAnswers[1], translatedAnswers[3]);
      console.log('[pdfGenerator] Additional skills generated:', additionalSkills);
    } catch (error) {
      console.error('[pdfGenerator] Error generating additional skills:', error);
    }
  }

  // Generate experience learning points using Gemini AI
  let experienceLearnings = '';
  if (translatedAnswers[4] && translatedAnswers[1]) {
    try {
      console.log('[pdfGenerator] Generating experience learnings...');
      experienceLearnings = await geminiClient.generateExperienceLearnings(translatedAnswers[4], translatedAnswers[1]);
      console.log('[pdfGenerator] Experience learnings generated:', experienceLearnings);
    } catch (error) {
      console.error('[pdfGenerator] Error generating experience learnings:', error);
    }
  }

  return new Promise((resolve) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });

    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    // Header
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text(`${translatedAnswers[0] || 'Name'}`, { align: 'center' })
       doc.moveDown(0.2)
       .font('Helvetica')
       doc.fontSize(12)
       .text(`[${translatedAnswers[1] || 'Profession'}]`, { align: 'center' })
       doc.moveDown(0.2)
       .font('Helvetica')
       .text(`${translatedAnswers[6] || 'Address'}`, { align: 'center' })
       doc.moveDown(0.2)
       .font('Helvetica')
       .text(`${answers[7] || 'Phone'}`, { align: 'center' });
    doc.moveDown(2);

    // Professional Summary
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('blue')
       .text('PROFESSIONAL SUMMARY');
    
    // Add underline extending to right edge
    const summaryY = doc.y;
    doc.moveTo(50, summaryY + 2)
       .lineTo(doc.page.width - 50, summaryY + 2)
       .stroke();
    doc.moveDown(0.4);
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('black')
       .text(professionalSummary);
    doc.moveDown(1);

    
    // Skills
    doc.fontSize(14)
    .font('Helvetica-Bold')
    .fillColor('blue')
    .text('SKILLS');
    
    // Add underline extending to right edge
    const skillsY = doc.y;
    doc.moveTo(50, skillsY + 2)
       .lineTo(doc.page.width - 50, skillsY + 2)
       .stroke();
       doc.moveDown(0.4);
    
       doc.fontSize(11)
       .font('Helvetica')
       .fillColor('black');
       
    // Display original skills as bullet points
    if (translatedAnswers[3]) {
      const inputSkills = translatedAnswers[3].split(',').map(skill => skill.trim()).filter(skill => skill);
      inputSkills.forEach(skill => {
        // Capitalize first letter and remove 'and' from the end
        let cleanSkill = skill.replace(/\s+and\s*$/i, ''); // Remove 'and' from the end
        cleanSkill = cleanSkill.charAt(0).toUpperCase() + cleanSkill.slice(1).toLowerCase(); // Capitalize first letter
        doc.text(`• ${cleanSkill}`);
      });
    }
    
    // Display additional AI-generated skills with bullet points
    if (additionalSkills) {
      const skillLines = additionalSkills.split('\n').filter(line => line.trim());
      skillLines.forEach(skill => {
        const cleanSkill = skill.replace(/^-\s*/, ''); // Remove the dash prefix
        doc.text(`• ${cleanSkill}`);
      });
    }
    doc.moveDown(1);

    // Experience
    doc.fontSize(14)
    .font('Helvetica-Bold')
    .fillColor('blue')
    .text('EXPERIENCE');
    
    // Add underline extending to right edge
    const experienceY = doc.y;
    doc.moveTo(50, experienceY + 2)
    .lineTo(doc.page.width - 50, experienceY + 2)
    .stroke();
    doc.moveDown(0.4);
    doc.fontSize(11)
    .font('Helvetica-Bold')
    .fillColor('black');
    
    // Display original experience
    if (translatedAnswers[4]) {
      doc.text(translatedAnswers[4]);
      doc.moveDown(0.3);
    }
    else{ //fallback
      doc.fontSize(11)
      .font('Helvetica')
      .text('No experience');
      doc.moveDown(0.3);
    }
    
    // Display AI-generated learning points
    if (experienceLearnings) {
      const learningLines = experienceLearnings.split('\n').filter(line => line.trim());
      learningLines.forEach(learning => {
        const cleanLearning = learning.replace(/^•\s*/, ''); // Remove the bullet prefix
        doc.font('Helvetica')
           .text(`• ${cleanLearning}`);
      });
    }
    doc.moveDown(1);

    // Education
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('blue')
       .text('EDUCATION');
    
    // Add underline extending to right edge
    const educationY = doc.y;
    doc.moveTo(50, educationY + 2)
       .lineTo(doc.page.width - 50, educationY + 2)
       .stroke();
    doc.moveDown(0.4);
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('black')
       .text(translatedAnswers[2] || 'Education');
    doc.moveDown(1);

    // Certifications
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('blue')
       .text('CERTIFICATIONS');
    
    // Add underline extending to right edge
    const certificationsY = doc.y;
    doc.moveTo(50, certificationsY + 2)
       .lineTo(doc.page.width - 50, certificationsY + 2)
       .stroke();
    doc.moveDown(0.4);
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('black')
       .text(translatedAnswers[5] || 'No certifications');
    doc.moveDown(1);

    doc.moveDown(2);
    doc.fontSize(10)
       .font('Helvetica-Oblique')
       .text('This resume was generated by AsaanCV', { align: 'center' });

    doc.end();
  });
};

export default pdfGenerator;
