const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certificateId: { type: String, required: true, unique: true },
  studentName: { type: String, required: true },
  course: { type: String, required: true },
  issueDate: { type: Date, default: Date.now },
  verified: { type: Boolean, default: true },
  pdfPath: { type: String, required: true }
});

module.exports = mongoose.model('Certificate', certificateSchema);
