import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import authMiddleware from './authMiddleware.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// MongoDB connection URI and database name
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = 'chessCafe';
let db;

// Connect to MongoDB
async function connectToDB() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log('Connected to MongoDB: orderview');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
}

connectToDB().then(() => {
  // Endpoint to get all orders for the authenticated user
  router.get('/orders', authMiddleware, async (req, res) => {
    try {
      const { username } = req.user;
      console.log('Fetching orders for username:', username);

      // Fetch orders for the authenticated user
      try {
        const orders = await db.collection('checkout').find({ username }).toArray();
        console.log('Orders fetched from database:', orders);
      
        // Include sequential order number for each order
        const ordersWithOrderNo = orders.map((order) => ({
          username: order.username,
          orders: order.orders.map((o, index) => ({
            orderNo: index + 1,
            name: o.name || 'N/A',
            address: o.address || 'N/A',
            phone: o.phone || 'Hidden', // Hide phone number for security
            items: (o.items || []).map(item => ({
              name: item.name || 'N/A',
              quantity: item.quantity || 0,
              price: item.price ? `₹${item.price}` : 'N/A'
            })),
            totalBill: o.totalBill ? `₹${o.totalBill}` : '₹0',
            orderDate: o.datePlaced
              ? new Date(o.datePlaced).toLocaleString()
              : 'N/A'
          }))
        }));
      
        console.log('Processed orders with order numbers:', ordersWithOrderNo);
        res.json(ordersWithOrderNo);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        res.status(500).send('Server error');
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      res.status(500).send('Server error');
    }
  });

  
});

export default router;
