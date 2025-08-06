import pdfGenerator from './backend/utils/pdfGenerator.js';
import fs from 'fs';

// Test the PDF generation with new 8-question structure
const testNewPDFGeneration = async () => {
  try {
    console.log('Testing new PDF generation with 8 questions...');
    
    // Dummy answers array for the new 8-question structure
    const dummyAnswers = [
      'احمد علی',                                    // name
      'پلمبر',                                      // profession
      'بیچلر آف کمپیوٹر سائنس 2022 میں مکمل ہوئی',  // education with year
      'پائپ فٹنگ، پلمبنگ، لیک ریپئر، انسٹالیشن',   // skills in detail
      '10 سال کا تجربہ، مختلف کمپنیوں میں کام کیا', // experience in detail
      'سرٹیفائیڈ پلمبر 2022',                      // certifications
      '123 مین سٹریٹ، کراچی، پاکستان',             // address with city
      '+92-300-1234567'                            // phone number
    ];
    
    console.log('Generating PDF with new structure...');
    const pdfBuffer = await pdfGenerator(dummyAnswers);
    
    // Save the PDF to a file
    const outputPath = './new-test-resume.pdf';
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log(`✅ New PDF generated successfully!`);
    console.log(`📄 File saved as: ${outputPath}`);
    console.log(`📊 File size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
  }
};

// Run the test
testNewPDFGeneration(); 