const mongoose = require('mongoose');

const verificationLogSchema = new mongoose.Schema({
  certificateNumber: { type: String, required: true },
  studentName: { type: String },
  institution: { type: String },
  course: { type: String },
  verificationStatus: { type: String, enum: ['verified', 'not_found', 'invalid'], required: true },
  verificationSource: { type: String },
  verifiedAt: { type: Date, default: Date.now },
  additionalInfo: { type: Object }
});

module.exports = mongoose.model('VerificationLog', verificationLogSchema);
