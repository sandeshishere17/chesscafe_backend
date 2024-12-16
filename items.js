import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function items() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db('chessCafe'); // Ensure this matches your actual database name
    const productsCollection = db.collection('items');
    const initialItems = [
      {
        "name": "Grilled Cheese Sandwich",
        "description": "Classic sandwich with melted cheese between slices of buttered bread, grilled to perfection.",
        "category": "sandwich",
        "price": "₹120",
        "pic": './imageoffood/grilledcheese.avif'
      },
      {
        "name": "Veggie Delight Sandwich",
        "description": "A fresh and healthy sandwich packed with a variety of vegetables and a hint of hummus.",
        "category": "sandwich",
        "price": "₹130",
        "pic": './imageoffood/veggiedelight.jpg'
      },
      {
        "name": "Chicken Club Sandwich",
        "description": "A hearty sandwich with layers of grilled chicken, bacon, lettuce, tomato, and mayonnaise.",
        "category": "sandwich",
        "price": "₹200",
        "pic": './imageoffood/ChickenClubSandwich.avif'
      },{
        "name": "Paneer Tikka Sandwich",
        "description": "A flavorful sandwich filled with marinated paneer tikka, onions, and bell peppers, served in toasted bread.",
        "category": "sandwich",
        "price": "₹180",
        "pic":'./imageoffood/paneertikka.avif'
      },
      

    ];
    
    // Insert products into the collection
    const result = await productsCollection.insertMany(initialItems);
    console.log(`${result.insertedCount} initial items inserted`);

  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await client.close();
  }
}

items()
