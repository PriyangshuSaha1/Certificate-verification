require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const certRoutes = require('./routes/certificates');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve uploaded PDFs (for temporary storage)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/certificates', certRoutes);

// Test route
app.get('/api', (req, res) => {
  res.send('Certificate Verification Backend with Internet Lookup!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
