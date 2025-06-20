const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const pdf = require('pdf-parse');
const axios = require('axios');
const cheerio = require('cheerio');

// Absolute path import for VerificationLog
const VerificationLog = require(path.join(__dirname, '..', 'models', 'VerificationLog'));

// Set up storage for PDFs
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Extract text from PDF
async function extractPDFText(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return null;
  }
}

// Extract certificate information from text
function extractCertificateInfo(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  let certificateNumber = '';
  let studentName = '';
  let institution = '';
  let course = '';

  // Common patterns for certificate numbers
  const certNumberPatterns = [
    /(?:certificate\s+(?:no|number|id)[\s:]+)([A-Z0-9\-\/]+)/i,
    /(?:cert[\s:]+)([A-Z0-9\-\/]+)/i,
    /(?:registration\s+(?:no|number)[\s:]+)([A-Z0-9\-\/]+)/i,
    /([A-Z]{2,4}[\-\/]?\d{4,}[\-\/]?[A-Z0-9]*)/,
  ];

  // Extract certificate number
  for (const pattern of certNumberPatterns) {
    for (const line of lines) {
      const match = line.match(pattern);
      if (match) {
        certificateNumber = match[1] || match[0];
        break;
      }
    }
    if (certificateNumber) break;
  }

  // Extract student name (usually appears after "this is to certify that" or similar)
  const namePatterns = [
    /(?:this\s+is\s+to\s+certify\s+that\s+)([A-Za-z\s.]+)(?:\s+has)/i,
    /(?:hereby\s+certify\s+that\s+)([A-Za-z\s.]+)(?:\s+has)/i,
    /(?:awarded\s+to\s+)([A-Za-z\s.]+)/i,
  ];

  for (const pattern of namePatterns) {
    for (const line of lines) {
      const match = line.match(pattern);
      if (match) {
        studentName = match[1].trim();
        break;
      }
    }
    if (studentName) break;
  }

  // Extract institution (look for university, institute, college)
  const institutionPatterns = [
    /([A-Za-z\s]+(?:University|Institute|College|Academy))/i,
    /(?:issued\s+by\s+)([A-Za-z\s]+)/i,
  ];

  for (const pattern of institutionPatterns) {
    for (const line of lines) {
      const match = line.match(pattern);
      if (match) {
        institution = match[1].trim();
        break;
      }
    }
    if (institution) break;
  }

  // Extract course information
  const coursePatterns = [
    /(?:course\s+in\s+)([A-Za-z\s]+)/i,
    /(?:degree\s+in\s+)([A-Za-z\s]+)/i,
    /(?:diploma\s+in\s+)([A-Za-z\s]+)/i,
    /(?:certificate\s+in\s+)([A-Za-z\s]+)/i,
  ];

  for (const pattern of coursePatterns) {
    for (const line of lines) {
      const match = line.match(pattern);
      if (match) {
        course = match[1].trim();
        break;
      }
    }
    if (course) break;
  }

  return {
    certificateNumber,
    studentName,
    institution,
    course,
    extractedText: text.substring(0, 500) // First 500 chars for debugging
  };
}

// Mock verification functions (replace with real APIs)
async function verifyWithGovernmentDatabase(certInfo) {
  if (certInfo.certificateNumber.includes('GOV') || certInfo.certificateNumber.includes('CERT')) {
    return {
      verified: true,
      source: 'Government Database',
      details: {
        status: 'Valid',
        issuingAuthority: 'Government of India',
        verificationDate: new Date().toISOString()
      }
    };
  }
  return { verified: false, source: 'Government Database' };
}

async function verifyWithUniversityDatabase(certInfo) {
  const mockUniversities = ['University', 'Institute', 'College', 'IIT', 'NIT'];
  if (mockUniversities.some(uni => certInfo.institution.toLowerCase().includes(uni.toLowerCase()))) {
    return {
      verified: true,
      source: certInfo.institution,
      details: {
        status: 'Valid',
        graduationDate: '2023-05-15',
        degreeVerified: true
      }
    };
  }
  return { verified: false, source: 'University Database' };
}

async function verifyWithProfessionalBodies(certInfo) {
  const professionalKeywords = ['engineering', 'medical', 'law', 'chartered', 'certified'];
  if (professionalKeywords.some(keyword => 
    certInfo.course.toLowerCase().includes(keyword) || 
    certInfo.institution.toLowerCase().includes(keyword)
  )) {
    return {
      verified: true,
      source: 'Professional Certification Body',
      details: {
        status: 'Valid',
        professionalBody: 'Certified Professional Institute',
        membershipStatus: 'Active'
      }
    };
  }
  return { verified: false, source: 'Professional Bodies' };
}

// Main verification endpoint
router.post('/verify', upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      valid: false, 
      message: 'PDF file required' 
    });
  }

  try {
    // Extract text from PDF
    const pdfText = await extractPDFText(req.file.path);

    if (!pdfText) {
      fs.unlinkSync(req.file.path); // Clean up file
      return res.status(400).json({ 
        valid: false, 
        message: 'Could not extract text from PDF' 
      });
    }

    // Extract certificate information
    const certInfo = extractCertificateInfo(pdfText);

    if (!certInfo.certificateNumber) {
      fs.unlinkSync(req.file.path); // Clean up file
      return res.status(400).json({ 
        valid: false, 
        message: 'Could not find certificate number in the document' 
      });
    }

    // Perform multiple verification checks
    const verificationResults = await Promise.all([
      verifyWithGovernmentDatabase(certInfo),
      verifyWithUniversityDatabase(certInfo),
      verifyWithProfessionalBodies(certInfo)
    ]);

    // Determine overall verification status
    const verifiedSources = verificationResults.filter(result => result.verified);
    const isVerified = verifiedSources.length > 0;

    // Log verification attempt
    const verificationLog = new VerificationLog({
      certificateNumber: certInfo.certificateNumber,
      studentName: certInfo.studentName,
      institution: certInfo.institution,
      course: certInfo.course,
      verificationStatus: isVerified ? 'verified' : 'not_found',
      verificationSource: verifiedSources.map(source => source.source).join(', '),
      additionalInfo: {
        extractedInfo: certInfo,
        verificationResults: verificationResults
      }
    });

    await verificationLog.save();

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    // Send response
    res.json({
      valid: isVerified,
      certificateNumber: certInfo.certificateNumber,
      studentName: certInfo.studentName,
      institution: certInfo.institution,
      course: certInfo.course,
      verificationSources: verifiedSources,
      message: isVerified ? 
        `Certificate verified by: ${verifiedSources.map(s => s.source).join(', ')}` : 
        'Certificate not found in any verification database',
      details: verifiedSources.length > 0 ? verifiedSources[0].details : null
    });

  } catch (error) {
    console.error('Verification error:', error);

    // Clean up file on error
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      valid: false, 
      message: 'Error processing certificate verification' 
    });
  }
});

// Get verification history
router.get('/history', async (req, res) => {
  try {
    const history = await VerificationLog.find()
      .sort({ verifiedAt: -1 })
      .limit(50)
      .select('-additionalInfo');

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching verification history' });
  }
});

module.exports = router;
