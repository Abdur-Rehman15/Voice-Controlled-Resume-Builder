import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Update lastActivity before saving
sessionSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

const Session = mongoose.model('Session', sessionSchema);

export default Session;
