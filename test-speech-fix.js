// Test script to verify speech recognition and validation fixes
console.log('Testing speech recognition and validation fixes...');

// Simulate the flow for the last question (phone number)
const testLastQuestion = async () => {
  console.log('Testing last question (phone number) flow...');
  
  // Simulate speech recognition result
  const mockSpeechResult = '03001234567';
  console.log('Mock speech result:', mockSpeechResult);
  
  // Simulate validation request
  try {
    const response = await fetch('http://localhost:5000/api/validate-answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        questionType: 'contact',
        answer: mockSpeechResult
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const validationResult = await response.json();
    console.log('Validation result:', validationResult);
    
    if (validationResult.valid) {
      console.log('✅ Phone number validation successful!');
      console.log('Extracted info:', validationResult.extractedInfo);
    } else {
      console.log('❌ Phone number validation failed:', validationResult.message);
    }
  } catch (error) {
    console.error('❌ Validation request failed:', error);
  }
};

// Run the test
testLastQuestion(); 