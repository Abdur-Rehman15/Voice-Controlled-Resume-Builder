import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  answers: {
    type: [String],
    required: true
  },
  translatedAnswers: {
    type: [String],
    required: true
  },
  professionalSummary: {
    type: String,
    required: true
  },
  additionalSkills: {
    type: String,
    default: ''
  },
  experienceLearnings: {
    type: String,
    default: ''
  },
  pdfBuffer: {
    type: Buffer,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
resumeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Resume = mongoose.model('Resume', resumeSchema);

export default Resume;
