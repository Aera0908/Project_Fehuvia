require('dotenv').config();
const express = require('express');
const cors = require('cors');
// const { OpenAI } = require('openai'); // Ready to be used
// const { ethers } = require('ethers'); // Ready to be used for Morph SDK

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Fehuvia Backend API' });
});

app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
});
