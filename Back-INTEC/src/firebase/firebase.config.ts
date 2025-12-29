import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();


let serviceAccount;

if (process.env.FIREBASE_PROJECT_ID) {
  // Use environment variables (Azure)
  serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };
} else {
  // Fallback to local file (Development)
  try {
    serviceAccount = require("../firebase/firebase-config.json");
  } catch (error) {
    console.error("Firebase config not found. Please set env vars or file.");
    serviceAccount = {};
  }
}

const storageBucket = process.env.STORAGE_BUCKET || "sistema-de-compras-97005.firebasestorage.app";
console.log('Initializing Firebase with Storage Bucket:', storageBucket);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://sistema-de-compras-97005-default-rtdb.firebaseio.com',
  storageBucket: storageBucket
});

export const db = admin.database();
export const storage = admin.storage().bucket();
console.log('Storage Bucket Name from instance:', storage.name);
