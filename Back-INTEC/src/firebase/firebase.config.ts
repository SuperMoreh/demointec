import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

var serviceAccount = require("../firebase/firebase-config.json");

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
