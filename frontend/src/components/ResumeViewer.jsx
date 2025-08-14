import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResumeViewer.css';

const ResumeViewer = () => {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState('');
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api';

  // Simple session management - try existing session first, then create new
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setLoading(true);
        
        // First, try to get existing session from localStorage
        const existingSessionId = localStorage.getItem('sessionId');
        console.log('[ResumeViewer] Existing session from localStorage:', existingSessionId);
        
        if (existingSessionId) {
          // Test if existing session has resumes
          console.log('[ResumeViewer] Testing existing session for resumes...');
          const testResponse = await fetch(`${API_BASE_URL}/resumes?sessionId=${existingSessionId}`, {
            headers: { 'X-Session-ID': existingSessionId }
          });
          const testData = await testResponse.json();
          
          if (testData.success && testData.resumes.length > 0) {
            console.log('[ResumeViewer] Existing session has resumes, using it');
            setSessionId(existingSessionId);
            setResumes(testData.resumes);
            await loadStats(existingSessionId);
            setLoading(false);
            return;
          } else {
            console.log('[ResumeViewer] Existing session has no resumes, will create new');
          }
        }
        
        // Create new session
        console.log('[ResumeViewer] Creating new session...');
        const response = await fetch(`${API_BASE_URL}/session/init`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        if (data.success) {
          const newSessionId = data.sessionId;
          console.log('[ResumeViewer] New session created:', newSessionId);
          setSessionId(newSessionId);
          localStorage.setItem('sessionId', newSessionId);
          
          // Load resumes for new session (will be empty initially)
          await loadResumes(newSessionId);
          await loadStats(newSessionId);
        } else {
          setError('Failed to initialize session');
        }
      } catch (error) {
        console.error('[ResumeViewer] Session initialization error:', error);
        setError('Backend server is not running. Please start the server and try again.');
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, []);

  const loadResumes = async (sessionIdToUse = sessionId) => {
    try {
      console.log('[ResumeViewer] Loading resumes for sessionId:', sessionIdToUse);
      const response = await fetch(`${API_BASE_URL}/resumes?sessionId=${sessionIdToUse}`, {
        headers: { 'X-Session-ID': sessionIdToUse }
      });

      const data = await response.json();
      console.log('[ResumeViewer] API response:', data);
      
      if (data.success) {
        setResumes(data.resumes);
        console.log('[ResumeViewer] Resumes loaded:', data.resumes.length);
      } else {
        console.error('[ResumeViewer] Failed to load resumes:', data.message);
        setError('Failed to load resumes');
      }
    } catch (error) {
      console.error('[ResumeViewer] Load resumes error:', error);
      setError('Failed to load resumes');
    }
  };

  const loadStats = async (sessionIdToUse = sessionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/resumes/stats?sessionId=${sessionIdToUse}`, {
        headers: { 'X-Session-ID': sessionIdToUse }
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  const downloadResume = async (resumeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}?sessionId=${sessionId}`, {
        headers: { 'X-Session-ID': sessionId }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume-${resumeId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download resume');
      }
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download resume');
    }
  };

  const deleteResume = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}?sessionId=${sessionId}`, {
        method: 'DELETE',
        headers: { 'X-Session-ID': sessionId }
      });

      const data = await response.json();
      
      if (data.success) {
        setResumes(resumes.filter(resume => resume._id !== resumeId));
        loadStats(); // Refresh stats
        console.log('Resume deleted:', resumeId);
      } else {
        setError('Failed to delete resume');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete resume');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="resume-viewer">
        <div className="loading">Loading your resumes...</div>
      </div>
    );
  }

  return (
    <div className="resume-viewer">
      <div className="header">
        <h2>📄 آپ کے محفوظ شدہ ریزیومے</h2>
        <p>Your Saved Resumes</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {stats && (
        <div className="stats">
          <div className="stat-item">
            <span className="stat-number">{stats.totalResumes}</span>
            <span className="stat-label">Total Resumes</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.todayResumes}</span>
            <span className="stat-label">Today</span>
          </div>
          {stats.lastCreated && (
            <div className="stat-item">
              <span className="stat-label">Last Created</span>
              <span className="stat-date">{formatDate(stats.lastCreated)}</span>
            </div>
          )}
        </div>
      )}

      {resumes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No resumes yet</h3>
          <p>Create your first resume to see it here!</p>
        </div>
      ) : (
        <div className="resumes-grid">
          {resumes.map((resume) => (
            <div key={resume._id} className="resume-card">
              <div className="resume-header">
                <h4>{resume.translatedAnswers[0] || 'Unnamed'}</h4>
                <span className="resume-date">{formatDate(resume.createdAt)}</span>
              </div>
              
              <div className="resume-details">
                <p><strong>Profession:</strong> {resume.translatedAnswers[1] || 'Not specified'}</p>
                <p><strong>Education:</strong> {resume.translatedAnswers[2] || 'Not specified'}</p>
                <p><strong>Skills:</strong> {resume.translatedAnswers[3] || 'Not specified'}</p>
              </div>

              <div className="resume-actions">
                <button 
                  className="btn-download"
                  onClick={() => downloadResume(resume._id)}
                >
                  📥 Download
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => deleteResume(resume._id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="session-info">
        <small>Session ID: {sessionId.substring(0, 8)}...</small>
        <div className="session-actions">
          <button onClick={() => loadResumes()} className="btn-refresh">
            🔄 Refresh
          </button>
          <button onClick={() => {
            localStorage.removeItem('sessionId');
            window.location.reload();
          }} className="btn-clear">
            🗑️ Clear Session
          </button>
          <button onClick={() => navigate('/')} className="btn-back">
            🏠 Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeViewer;
