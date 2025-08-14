import fetch from 'node-fetch';

async function debugResumeIssue() {
  try {
    console.log('🔍 DEBUGGING RESUME ISSUE - COMPREHENSIVE TEST');
    console.log('=' .repeat(60));
    
    // Step 1: Test backend connectivity
    console.log('\n1️⃣ Testing backend connectivity...');
    try {
      const healthResponse = await fetch('http://localhost:5000/api/session/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('✅ Backend is running');
    } catch (error) {
      console.log('❌ Backend is not running:', error.message);
      return;
    }
    
    // Step 2: Get all existing sessions from database
    console.log('\n2️⃣ Testing with known session that has resumes...');
    const knownSessionId = 'ed474bfe6a675a70429fc188404c227fe02ee35f7ed3a7b7c02f9b3e0c615bbc';
    
    // Test session validation
    console.log('   Testing session validation...');
    const validateResponse = await fetch(`http://localhost:5000/api/session/validate?sessionId=${knownSessionId}`);
    const validateData = await validateResponse.json();
    console.log('   Session validation result:', validateData);
    
    // Test resume retrieval
    console.log('   Testing resume retrieval...');
    const resumesResponse = await fetch(`http://localhost:5000/api/resumes?sessionId=${knownSessionId}`, {
      headers: { 'X-Session-ID': knownSessionId }
    });
    const resumesData = await resumesResponse.json();
    console.log('   Resumes response:', JSON.stringify(resumesData, null, 2));
    
    // Step 3: Test new session creation
    console.log('\n3️⃣ Testing new session creation...');
    const newSessionResponse = await fetch('http://localhost:5000/api/session/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const newSessionData = await newSessionResponse.json();
    console.log('   New session created:', newSessionData);
    
    // Step 4: Test resume retrieval for new session
    if (newSessionData.success) {
      console.log('\n4️⃣ Testing resume retrieval for new session...');
      const newSessionResumesResponse = await fetch(`http://localhost:5000/api/resumes?sessionId=${newSessionData.sessionId}`, {
        headers: { 'X-Session-ID': newSessionData.sessionId }
      });
      const newSessionResumesData = await newSessionResumesResponse.json();
      console.log('   New session resumes:', JSON.stringify(newSessionResumesData, null, 2));
    }
    
    // Step 5: Test all known sessions
    console.log('\n5️⃣ Testing all known sessions from database...');
    const knownSessions = [
      '458f231809be85993923e234c511a1e88c25f9c3118b989da7127cb076e4611d',
      '53533ca769a0adff36381d9c2d8661e8100c1c1660d80d76a6ecf38f97113847',
      '873db7f3c65d1ca1972cd80e91a0dcd2214cb3c045439eed031cda6bfd08ab07',
      'bdac1a664b0484337cce7f0512f779aed4545dd33c59173e14a563997d38e2cd',
      'd2b9bd15fa43567d4fa35ca9216b51b173bed614dcf3b3dfe3c56aa839c4a2aa',
      'd3ee53281522810336d099e6564b2accf47a54c40d0688ce04e9e6e28414334f',
      'ebef4b7512f9f2626a5dba0aaac3a554ea0bc1a0711e18af68acf1a7a7ef52fa',
      'ed474bfe6a675a70429fc188404c227fe02ee35f7ed3a7b7c02f9b3e0c615bbc'
    ];
    
    for (const sessionId of knownSessions) {
      console.log(`   Testing session: ${sessionId.substring(0, 8)}...`);
      try {
        const response = await fetch(`http://localhost:5000/api/resumes?sessionId=${sessionId}`, {
          headers: { 'X-Session-ID': sessionId }
        });
        const data = await response.json();
        if (data.success && data.resumes.length > 0) {
          console.log(`   ✅ Session ${sessionId.substring(0, 8)} has ${data.resumes.length} resumes`);
        } else {
          console.log(`   ❌ Session ${sessionId.substring(0, 8)} has no resumes`);
        }
      } catch (error) {
        console.log(`   ❌ Session ${sessionId.substring(0, 8)} error:`, error.message);
      }
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('🔍 DEBUG COMPLETE');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugResumeIssue();
