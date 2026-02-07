// lib/mongodb.js
import 'server-only';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) throw new Error('Please add your Mongo URI to environment variables');

let client;
let clientPromise;

const options = {
  ssl: true, // force TLS
  retryWrites: true,
  w: 'majority'
};

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
