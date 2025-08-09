import SessionManager from '../utils/sessionManager.js';

// Initialize a new session
export const initializeSession = async (req, res) => {
  try {
    console.log('[initializeSession] Creating new session');
    
    const sessionId = await SessionManager.createSession();
    
    console.log(`[initializeSession] Session created: ${sessionId}`);
    
    res.json({
      success: true,
      sessionId: sessionId,
      message: 'Session initialized successfully'
    });

  } catch (error) {
    console.error('[initializeSession] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to initialize session', 
      error: error.message 
    });
  }
};

// Validate existing session
export const validateSession = async (req, res) => {
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Session ID required' 
    });
  }

  try {
    console.log(`[validateSession] Validating session: ${sessionId}`);
    
    const isValid = await SessionManager.validateSession(sessionId);
    
    if (isValid) {
      console.log(`[validateSession] Session valid: ${sessionId}`);
      res.json({
        success: true,
        sessionId: sessionId,
        valid: true,
        message: 'Session is valid'
      });
    } else {
      console.log(`[validateSession] Session invalid: ${sessionId}`);
      res.json({
        success: true,
        sessionId: null,
        valid: false,
        message: 'Session is invalid'
      });
    }

  } catch (error) {
    console.error('[validateSession] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to validate session', 
      error: error.message 
    });
  }
};

// Get session information
export const getSessionInfo = async (req, res) => {
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Session ID required' 
    });
  }

  try {
    console.log(`[getSessionInfo] Getting info for session: ${sessionId}`);
    
    const sessionInfo = await SessionManager.getSessionInfo(sessionId);
    
    if (sessionInfo) {
      console.log(`[getSessionInfo] Session info retrieved: ${sessionId}`);
      res.json({
        success: true,
        session: sessionInfo,
        message: 'Session information retrieved'
      });
    } else {
      console.log(`[getSessionInfo] Session not found: ${sessionId}`);
      res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

  } catch (error) {
    console.error('[getSessionInfo] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get session info', 
      error: error.message 
    });
  }
};
