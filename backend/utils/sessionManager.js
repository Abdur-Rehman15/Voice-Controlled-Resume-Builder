import crypto from 'crypto';
import Session from '../models/Session.js';

class SessionManager {
  // Generate a unique session ID
  static generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Create a new session
  static async createSession() {
    try {
      const sessionId = this.generateSessionId();
      const session = new Session({
        sessionId: sessionId
      });
      
      await session.save();
      console.log(`[SessionManager] Created new session: ${sessionId}`);
      return sessionId;
    } catch (error) {
      console.error('[SessionManager] Error creating session:', error);
      throw error;
    }
  }

  // Validate and update session
  static async validateSession(sessionId) {
    try {
      const session = await Session.findOne({ 
        sessionId: sessionId,
        isActive: true 
      });

      if (!session) {
        console.log(`[SessionManager] Invalid session: ${sessionId}`);
        return false;
      }

      // Update last activity
      session.lastActivity = new Date();
      await session.save();
      
      console.log(`[SessionManager] Validated session: ${sessionId}`);
      return true;
    } catch (error) {
      console.error('[SessionManager] Error validating session:', error);
      return false;
    }
  }

  // Get session info
  static async getSessionInfo(sessionId) {
    try {
      const session = await Session.findOne({ sessionId: sessionId });
      return session;
    } catch (error) {
      console.error('[SessionManager] Error getting session info:', error);
      return null;
    }
  }

  // Clean up old sessions (optional - for maintenance)
  static async cleanupOldSessions(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Session.updateMany(
        { 
          lastActivity: { $lt: cutoffDate },
          isActive: true 
        },
        { isActive: false }
      );

      console.log(`[SessionManager] Cleaned up ${result.modifiedCount} old sessions`);
      return result.modifiedCount;
    } catch (error) {
      console.error('[SessionManager] Error cleaning up sessions:', error);
      return 0;
    }
  }
}

export default SessionManager;
