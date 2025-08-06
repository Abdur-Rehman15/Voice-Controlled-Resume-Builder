import fetch from 'node-fetch';
import fs from 'fs';

// Test the resume generation API endpoint
const testResumeAPI = async () => {
  try {
    console.log('Testing resume generation API...');
    
    // Dummy answers array (same structure as the frontend sends)
    const dummyData = {
      answers: [
        'احمد علی',           // name
        'بیچلر آف کمپیوٹر سائنس',  // education
        'جاوا اسکرپٹ، ریئیکٹ، نوڈ جے ایس',  // skills
        'سافٹ ویئر ڈویلپر',  // experience
        '+92-300-1234567'    // contact
      ]
    };
    
    console.log('Sending request to API...');
    const response = await fetch('http://localhost:5000/api/generate-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dummyData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const pdfBuffer = await response.buffer();
    
    // Save the PDF to a file
    const outputPath = './api-test-resume.pdf';
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log(`✅ API test successful!`);
    console.log(`📄 File saved as: ${outputPath}`);
    console.log(`📊 File size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('Make sure the backend server is running on port 5000');
  }
};

// Run the test
testResumeAPI(); 