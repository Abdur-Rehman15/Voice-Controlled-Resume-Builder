import SessionManager from '../utils/sessionManager.js';

const sessionMiddleware = async (req, res, next) => {
  try {
    // Get session ID from headers or query parameters
    let sessionId = req.headers['x-session-id'] || req.query.sessionId;

    // If no session ID, create a new one
    if (!sessionId) {
      sessionId = await SessionManager.createSession();
      res.setHeader('X-Session-ID', sessionId);
    } else {
      // Validate existing session
      const isValid = await SessionManager.validateSession(sessionId);
      if (!isValid) {
        // Create new session if invalid
        sessionId = await SessionManager.createSession();
        res.setHeader('X-Session-ID', sessionId);
      }
    }

    // Add session ID to request object
    req.sessionId = sessionId;
    next();
  } catch (error) {
    console.error('[SessionMiddleware] Error:', error);
    res.status(500).json({ error: 'Session management error' });
  }
};

export default sessionMiddleware;
