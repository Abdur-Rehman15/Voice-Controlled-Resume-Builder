import fetch from 'node-fetch';

// Test the contact validation
const testContactValidation = async () => {
  try {
    console.log('Testing contact validation...');
    
    const testData = {
      questionType: 'contact',
      answer: '+92-300-1234567'
    };
    
    console.log('Sending validation request:', testData);
    
    const response = await fetch('http://localhost:5000/api/validate-answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Validation result:', result);
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

// Run the test
testContactValidation(); 