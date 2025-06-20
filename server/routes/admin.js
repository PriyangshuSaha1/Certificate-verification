const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const authMiddleware = require('../middleware/auth');

// Admin login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ 
        error: 'Invalid credentials' 
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ 
        error: 'Invalid credentials' 
      });
    }

    const token = jwt.sign(
      { id: admin._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    res.json({ token });
  } catch (err) {
    res.status(500).json({ 
      error: 'Server error' 
    });
  }
});

// Add new certificate (Admin only)
router.post('/add-certificate', authMiddleware, async (req, res) => {
  const { certificateId, studentName, course } = req.body;
  
  try {
    const newCertificate = new Certificate({ 
      certificateId, 
      studentName, 
      course 
    });
    
    await newCertificate.save();
    
    res.status(201).json(newCertificate);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ 
        error: 'Certificate ID already exists' 
      });
    }
    res.status(500).json({ 
      error: 'Server error' 
    });
  }
});

module.exports = router;
