const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🧪 Testing API endpoints...');
    
    // Test session initialization
    console.log('\n1. Testing session initialization...');
    const sessionResponse = await fetch('http://localhost:5000/api/session/init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const sessionData = await sessionResponse.json();
    console.log('Session response:', sessionData);
    
    if (sessionData.success) {
      const sessionId = sessionData.sessionId;
      console.log('✅ Session created:', sessionId);
      
      // Test getting resumes for this session
      console.log('\n2. Testing resume retrieval...');
      const resumesResponse = await fetch(`http://localhost:5000/api/resumes?sessionId=${sessionId}`, {
        headers: {
          'X-Session-ID': sessionId,
        },
      });
      
      const resumesData = await resumesResponse.json();
      console.log('Resumes response:', resumesData);
      
      if (resumesData.success) {
        console.log(`✅ Found ${resumesData.resumes.length} resumes for session`);
        if (resumesData.resumes.length > 0) {
          console.log('Sample resume:', resumesData.resumes[0]);
        }
      } else {
        console.log('❌ Failed to get resumes:', resumesData.message);
      }
      
      // Test getting stats
      console.log('\n3. Testing stats retrieval...');
      const statsResponse = await fetch(`http://localhost:5000/api/resumes/stats?sessionId=${sessionId}`, {
        headers: {
          'X-Session-ID': sessionId,
        },
      });
      
      const statsData = await statsResponse.json();
      console.log('Stats response:', statsData);
      
    } else {
      console.log('❌ Failed to create session:', sessionData.message);
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI();
