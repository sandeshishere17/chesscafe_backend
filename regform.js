import express from 'express';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config(); // Ensure environment variables are loaded

const router = express.Router();

// MongoDB connection URI and database name
const uri = process.env.MONGODB_URI;
const dbName = 'chessCafe';

let db;

// Use async/await to connect to MongoDB and set up the db variable
const connectToMongoDB = async () => {
  try {
    const client = new MongoClient(uri, );
    await client.connect(); // Ensure connection is established
    db = client.db(dbName);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1); // Exit process with failure
  }
};

// Connect to MongoDB before handling routes
connectToMongoDB();

// Use POST method for registration
router.post('/', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Please fill in all fields' });
  }

  try {
    const registerDataCollection = db.collection('register_data');

    // Check if the user already exists
    const existingUser = await registerDataCollection.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password before storing it
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the new user into the 'register_data' collection
    const result = await registerDataCollection.insertOne({ username, email, password: hashedPassword });

    res.status(201).json({ message: 'User registered successfully', userId: result.insertedId });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
