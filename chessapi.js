// chessapi.js
import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const fetchWithRetry = async (url, options, retries = 3, backoff = 300) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { ...options, timeout: 5000 }); // 5-second timeout
      if (!response.ok) {
        throw new Error(`Network response was not ok, status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (i < retries - 1) {
        console.log(`Retrying... (${i + 1})`);
        await new Promise(resolve => setTimeout(resolve, backoff)); // Exponential backoff
      } else {
        throw error;
      }
    }
  }
};

router.get('/puzzle', async (req, res) => {
  const LICHESS_API_TOKEN = process.env.LICHESS_API_TOKEN;

  try {
    const puzzle = await fetchWithRetry('https://lichess.org/api/puzzle/daily', {
      headers: {
        'Authorization': `Bearer ${LICHESS_API_TOKEN}`
      }
    });
    res.json(puzzle);
  } catch (error) {
    console.error('Failed to fetch puzzle:', error);
    res.status(500).send('Server error');
  }
});

export default router;
