import Resume from '../models/Resume.js';

// Get all resumes for a session
export const getResumes = async (req, res) => {
  const { sessionId } = req;

  if (!sessionId) {
    return res.status(400).json({ success: false, message: 'Session ID required' });
  }

  try {
    console.log(`[getResumes] Fetching resumes for session: ${sessionId}`);

    const resumes = await Resume.find({ sessionId: sessionId })
      .select('-pdfBuffer') // Exclude PDF buffer from list
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();

    console.log(`[getResumes] Found ${resumes.length} resumes for session: ${sessionId}`);

    res.json({
      success: true,
      resumes: resumes,
      count: resumes.length
    });

  } catch (error) {
    console.error('[getResumes] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch resumes', error: error.message });
  }
};

// Get a specific resume by ID
export const getResume = async (req, res) => {
  const { sessionId } = req;
  const { resumeId } = req.params;

  if (!sessionId) {
    return res.status(400).json({ success: false, message: 'Session ID required' });
  }

  if (!resumeId) {
    return res.status(400).json({ success: false, message: 'Resume ID required' });
  }

  try {
    console.log(`[getResume] Fetching resume ${resumeId} for session: ${sessionId}`);

    const resume = await Resume.findOne({
      _id: resumeId,
      sessionId: sessionId
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    console.log(`[getResume] Resume found: ${resumeId}`);

    // Send PDF response
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="resume-${resumeId}.pdf"`,
      'X-Session-ID': sessionId
    });
    res.send(resume.pdfBuffer);

  } catch (error) {
    console.error('[getResume] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch resume', error: error.message });
  }
};

// Delete a resume
export const deleteResume = async (req, res) => {
  const { sessionId } = req;
  const { resumeId } = req.params;

  if (!sessionId) {
    return res.status(400).json({ success: false, message: 'Session ID required' });
  }

  if (!resumeId) {
    return res.status(400).json({ success: false, message: 'Resume ID required' });
  }

  try {
    console.log(`[deleteResume] Deleting resume ${resumeId} for session: ${sessionId}`);

    const result = await Resume.deleteOne({
      _id: resumeId,
      sessionId: sessionId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    console.log(`[deleteResume] Resume deleted: ${resumeId}`);

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });

  } catch (error) {
    console.error('[deleteResume] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete resume', error: error.message });
  }
};

// Get resume statistics
export const getResumeStats = async (req, res) => {
  const { sessionId } = req;

  if (!sessionId) {
    return res.status(400).json({ success: false, message: 'Session ID required' });
  }

  try {
    console.log(`[getResumeStats] Getting stats for session: ${sessionId}`);

    const totalResumes = await Resume.countDocuments({ sessionId: sessionId });
    const todayResumes = await Resume.countDocuments({
      sessionId: sessionId,
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
    });

    const latestResume = await Resume.findOne({ sessionId: sessionId })
      .sort({ createdAt: -1 })
      .select('createdAt')
      .lean();

    console.log(`[getResumeStats] Stats calculated for session: ${sessionId}`);

    res.json({
      success: true,
      stats: {
        totalResumes,
        todayResumes,
        lastCreated: latestResume ? latestResume.createdAt : null
      }
    });

  } catch (error) {
    console.error('[getResumeStats] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to get statistics', error: error.message });
  }
};
