import express from 'express';
import authMiddleware from './authMiddleware.js';
import { MongoClient } from 'mongodb';

const router = express.Router();
const dbName = 'chessCafe'; // Your database name
const url = process.env.MONGODB_URI; // Your MongoDB URI

// Connect to MongoDB
const client = new MongoClient(url);
let db;

client.connect().then(() => {
  db = client.db(dbName);
  console.log('Connected to MongoDB for checkout');
}).catch(error => {
  console.error('Failed to connect to MongoDB for checkout', error);
});

// Endpoint to handle checkout
router.post('/checkout', authMiddleware, async (req, res) => {
  const { items, totalBill, name, address, phone, paymentMethods, paymentDetails } = req.body;
  const username = req.user.username; // Extract username from req.user

  if (!items || !totalBill || !name || !address || !phone || !paymentMethods) {
    return res.status(400).send('All fields are required');
  }

  // Validate phone number
  if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
    return res.status(400).send('Please enter a valid 10-digit phone number.');
  }

  try {
    // Check if user exists in the checkout collection
    let userCheckout = await db.collection('checkout').findOne({ username: username });

    // If the user does not exist, create a new document for them in the checkout collection
    if (!userCheckout) {
      userCheckout = {
        username: username,
        orders: [],
      };
      await db.collection('checkout').insertOne(userCheckout);
      userCheckout = await db.collection('checkout').findOne({ username: username });
    }

    // Create the order object
    const order = {
      items,
      totalBill,
      name,
      address,
      phone,
      paymentMethods,
      paymentDetails,
      datePlaced: new Date(),
    };

    // Add the order to the user's document
    await db.collection('checkout').updateOne(
      { username: username },
      { $push: { orders: order } }
    );

    res.status(201).json({ message: 'Order placed successfully' });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).send('Server error');
  }
});

export default router;
