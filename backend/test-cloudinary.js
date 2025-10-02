// Test Cloudinary connection
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Testing Cloudinary connection...');
console.log('Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set'
});

// Test the connection
cloudinary.api.ping((error, result) => {
  if (error) {
    console.error('❌ Cloudinary connection failed:', error);
  } else {
    console.log('✅ Cloudinary connection successful:', result);
  }
});