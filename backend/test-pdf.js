import pdfGenerator from './utils/pdfGenerator.js';
import fs from 'fs';

// Test the PDF generation with dummy data
const testPDFGeneration = async () => {
  try {
    console.log('Testing PDF generation...');
    
    // Dummy answers array (same structure as the frontend sends)
    const dummyAnswers = [
      'احمد علی',           // name
      'بیچلر آف کمپیوٹر سائنس',  // education
      'جاوا اسکرپٹ، ریئیکٹ، نوڈ جے ایس',  // skills
      'سافٹ ویئر ڈویلپر',  // experience
      '+92-300-1234567'    // contact
    ];
    
    console.log('Generating PDF with dummy data...');
    const pdfBuffer = await pdfGenerator(dummyAnswers);
    
    // Save the PDF to a file
    const outputPath = './test-resume.pdf';
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log(`✅ PDF generated successfully!`);
    console.log(`📄 File saved as: ${outputPath}`);
    console.log(`📊 File size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
  }
};

// Run the test
testPDFGeneration(); 