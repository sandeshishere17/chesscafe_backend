import express from 'express';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const uri = process.env.MONGODB_URI; // Your MongoDB connection string
const client = new MongoClient(uri);
const dbName = 'chessCafe';
let db;

async function connectToDB() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log('Connected to MongoDB:', dbName);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
}

connectToDB().then(() => {
  // Login route
  router.post('/', async (req, res) => {
    const { username, password } = req.body;

    try {
      const user = await db.collection('register_data').findOne({ username });

      if (!user) {
        return res.status(400).json({ error: 'Invalid username or password' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ error: 'Invalid username or password' });
      }

      const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

export default router;
