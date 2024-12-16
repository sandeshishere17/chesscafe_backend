// Import necessary modules
import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import authMiddleware from './authMiddleware.js';

dotenv.config();

const router = express.Router();
const url = process.env.MONGODB_URI;
const dbName = 'chessCafe'; // Replace with your database name
let db;

// Connect to MongoDB
MongoClient.connect(url)
  .then(async (client) => {
    console.log('Connected to MongoDB Atlas');
    db = client.db(dbName);
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Endpoint to add an item to the cart
router.post('/addtocart', authMiddleware, async (req, res) => {
  const item = req.body;
  const username = req.user.username; // Get the username from the decoded token

  try {
    const cart = await db.collection('item_inaddcart').findOne({ username });
    
    if (cart) {
      // Check if the item already exists in the cart
      const existingItem = cart.items.find(i => i._id.toString() === item._id);

      if (existingItem) {
        // Update the quantity of the existing item
        await db.collection('item_inaddcart').updateOne(
          { username, "items._id": new ObjectId(item._id) },
          { $set: { "items.$.quantity": existingItem.quantity + item.quantity } }
        );
      } else {
        // Add the new item to the cart
        await db.collection('item_inaddcart').updateOne(
          { username },
          { $push: { items: item } },
          { upsert: true }
        );
      }
    } else {
      // Create a new cart and add the item
      await db.collection('item_inaddcart').insertOne({
        username,
        items: [item]
      });
    }

    res.status(201).json({ ...item });
  } catch (error) {
    console.error('Failed to add item to cart:', error);
    res.status(500).send('Server error');
  }
});

// Endpoint to get all items in the cart
router.get('/getcartitems', authMiddleware, async (req, res) => {
  const username = req.user.username; // Get the username from the decoded token

  try {
    const cart = await db.collection('item_inaddcart').findOne({ username });
    res.json(cart ? cart.items : []);
  } catch (error) {
    console.error('Failed to fetch cart items:', error);
    res.status(500).send('Server error');
  }
});

// Endpoint to remove an item from the cart
router.delete('/removefromcart/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const username = req.user.username; // Get the username from the decoded token

  try {
    const result = await db.collection('item_inaddcart').updateOne(
      { username },
      { $pull: { items: { _id: new ObjectId(id) } } }
    );
    res.status(200).send(`Item removed from cart: ${result.modifiedCount}`);
  } catch (error) {
    console.error('Failed to remove item from cart:', error);
    res.status(500).send('Server error');
  }
});

// Endpoint to update item quantity in the cart
router.put('/updatequantity/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const username = req.user.username; // Get the username from the decoded token

  try {
    const result = await db.collection('item_inaddcart').updateOne(
      { username, "items._id": new ObjectId(id) },
      { $set: { "items.$.quantity": quantity } }
    );
    res.status(200).send(`Item quantity updated: ${result.modifiedCount}`);
  } catch (error) {
    console.error('Failed to update item quantity:', error);
    res.status(500).send('Server error');
  }
});

// Endpoint to clear the cart
router.delete('/clearcart', authMiddleware, async (req, res) => {
  const username = req.user.username; // Get the username from the decoded token

  try {
    const result = await db.collection('item_inaddcart').updateOne(
      { username },
      { $set: { items: [] } }
    );
    res.status(200).send(`Cart cleared: ${result.modifiedCount}`);
  } catch (error) {
    console.error('Failed to clear cart:', error);
    res.status(500).send('Server error');
  }
});

export default router;
