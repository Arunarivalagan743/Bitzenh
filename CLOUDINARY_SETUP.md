# Cloudinary Configuration Guide

## Step 1: Create a Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. After signup, go to your Dashboard

## Step 2: Get Your Cloudinary Credentials
From your Cloudinary Dashboard, you'll find:
- **Cloud Name**: (e.g., "your-cloud-name")
- **API Key**: (e.g., "123456789012345")
- **API Secret**: (e.g., "your-secret-key")

## Step 3: Update the Configuration File
Edit the file: `backend/config/cloudinary.js`

Replace these values with your actual Cloudinary credentials:

```javascript
cloudinary.config({
  cloud_name: 'your-actual-cloud-name',    // Replace with your cloud name
  api_key: 'your-actual-api-key',          // Replace with your API key
  api_secret: 'your-actual-api-secret'     // Replace with your API secret
});
```

## Important Security Note
- Never commit your actual credentials to Git
- Consider using environment variables in production:

```javascript
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
```

## Features Included
✅ Automatic image optimization
✅ Resizing to max 800x600
✅ Quality optimization
✅ Organized in 'college-portal-questions' folder
✅ Support for JPG, PNG, GIF, WebP formats
✅ 5MB file size limit
✅ Image deletion capability

## Testing
After updating the credentials:
1. Start your backend server: `npm start`
2. Try uploading an image via the frontend
3. Check your Cloudinary Dashboard to see uploaded images