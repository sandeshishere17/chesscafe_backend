import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();  // Load environment variables from .env

const router = express.Router();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Route to get all items
router.get('/api/items', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('chessCafe');
        const collection = database.collection('items');

        const items = await collection.find().toArray();
        res.status(200).json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ error: 'Failed to fetch items' });
    } finally {
        await client.close();
    }
});

// Route to get a specific item by _id
router.get('/api/item/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await client.connect();
        const database = client.db('chessCafe');
        const collection = database.collection('items');

        // Find the item by _id
        const item = await collection.findOne({ _id: new ObjectId(id) });

        if (item) {
            res.status(200).json(item);
        } else {
            res.status(404).json({ error: 'Item not found' });
        }
    } catch (error) {
        console.error(`Error fetching item with _id ${id}:`, error);
        res.status(500).json({ error: 'Failed to fetch item' });
    } finally {
        await client.close();
    }
});

// Route to add a new item (optional)
router.post('/api/items', async (req, res) => {
    const newItem = req.body;

    try {
        await client.connect();
        const database = client.db('chessCafe');
        const collection = database.collection('items');

        const result = await collection.insertOne(newItem);
        res.status(201).json({ message: 'Item added successfully', itemId: result.insertedId });
    } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).json({ error: 'Failed to add item' });
    } finally {
        await client.close();
    }
});

// Route to update an item by _id (optional)
router.put('/api/item/:id', async (req, res) => {
    const { id } = req.params;
    const updatedItem = req.body;

    try {
        await client.connect();
        const database = client.db('chessCafe');
        const collection = database.collection('items');

        const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updatedItem });

        if (result.matchedCount > 0) {
            res.status(200).json({ message: 'Item updated successfully' });
        } else {
            res.status(404).json({ error: 'Item not found' });
        }
    } catch (error) {
        console.error(`Error updating item with _id ${id}:`, error);
        res.status(500).json({ error: 'Failed to update item' });
    } finally {
        await client.close();
    }
});

// Route to delete an item by _id (optional)
router.delete('/api/item/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await client.connect();
        const database = client.db('chessCafe');
        const collection = database.collection('items');

        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount > 0) {
            res.status(200).json({ message: 'Item deleted successfully' });
        } else {
            res.status(404).json({ error: 'Item not found' });
        }
    } catch (error) {
        console.error(`Error deleting item with _id ${id}:`, error);
        res.status(500).json({ error: 'Failed to delete item' });
    } finally {
        await client.close();
    }
});

export default router;
