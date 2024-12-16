import express from 'express';
import authMiddleware from './authMiddleware.js';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import regformRouter from './regform.js'
import loginRouter from './login.js';
import chessApiRoutes from './chessapi.js';
import addtocartRoutes from './addtocart.js';
import checkoutRoutes from './checkout.js'; 
import orderViewRouter from './orderview.js';  
import itemscollections from './itemscollections.js';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';


dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Define the __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from 'public/imageoffood' directory
app.use('/imageoffood', express.static(path.join(__dirname, 'public', 'imageoffood')));

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

app.use(express.json());

// MongoDB Connection
const url = process.env.MONGODB_URI;
const dbName = 'chessCafe';
let db;

const connectToMongoDB = async () => {
  try {
    const client = await MongoClient.connect(url);
    db = client.db(dbName);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1); // Exit process with failure
  }
};

// Connect to MongoDB before starting the server
connectToMongoDB().then(() => {
  // Routes
  app.get('/', (req, res) => {
    res.send('Server is ready to go');
  });

  // Endpoint to store a message and email
  app.post('/api/messages', async (req, res) => {
    const { email, message } = req.body;
    if (!email || !message) {
      return res.status(400).send('Email and message are required');
    }

    const newMessage = {
      email,
      message,
      timestamp: new Date(),
    };

    try {
      const result = await db.collection('messages').insertOne(newMessage);
      console.log('Message stored:', result.insertedId);
      res.status(201).json({ _id: result.insertedId, ...newMessage });
    } catch (error) {
      console.error('Failed to insert message:', error);
      res.status(500).send('Server error');
    }
  });



  // Endpoint to get all messages
  app.get('/api/messages', async (req, res) => {
    try {
      const messages = await db.collection('messages').find().toArray();
      res.json(messages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      res.status(500).send('Server error');
    }
  });


  
  app.use(itemscollections);

 // Registration and Login routes
 app.use('/api/regform', regformRouter);
 app.use('/api/login', loginRouter);

 // Protected route example
app.get('/protected', authMiddleware, (req, res) => {
  res.send('This is a protected route. User is authenticated.');
});

  // Search endpoint
  app.get('/api/search', async (req, res) => {
    const query = req.query.query;
    if (!query) {
      return res.status(400).send('Query parameter is required');
    }

    try {
      const results = await db.collection('items').find({
        $text: { $search: query }
      }).toArray();
      res.json(results);
    } catch (error) {
      console.error('Failed to perform search:', error);
      res.status(500).send('Server error');
    }
  });

  // Chess API routes
  app.use('/api/chess', chessApiRoutes);

  // Add cart routes from addtocart.js
  app.use('/api', addtocartRoutes);
  //checkout
  app.use('/api',checkoutRoutes);

  // Order view routes
  app.use('/api', orderViewRouter);

  

  // Event data store
  app.post('/api/registerForEvent', async (req, res) => {
    const { reason, phoneNumber } = req.body;

    const eventDetails = {
      reason,
      phoneNumber,
      dateRegistered: new Date()
    };

    try {
      const result = await db.collection('event').insertOne(eventDetails);
      res.status(200).json({ message: 'Event registration successful', data: result });
    } catch (error) {
      console.error('Error registering for event:', error);
      res.status(500).json({ message: 'Error registering for event' });
    }
  });

  // Start the server
  app.listen(port, () => {
    console.log(`Server at http://localhost:${port}`);
  });
});
