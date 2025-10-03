const express = require('express');
const { cloudinary, upload } = require('../config/cloudinary');
const router = express.Router();

const DEFAULT_UPLOAD_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || 'college-portal-questions';
const DEFAULT_TRANSFORMATIONS = [
  { width: 800, height: 600, crop: 'limit' },
  { quality: 'auto' }
];

// --------------------
// Upload Image Route
// --------------------
router.post('/', upload.single('image'), async (req, res) => {
  try {
    console.log('Upload route hit');
    console.log('File received:', req.file ? 'Yes' : 'No');
    
    if (req.file) {
      console.log('File details:', {
        originalname: req.file.originalname,
        path: req.file.path,
        filename: req.file.filename,
        size: req.file.size
      });

      const result = {
        success: true,
        message: 'Image uploaded successfully',
        imageUrl: req.file.path, // Cloudinary URL
        publicId: req.file.filename, // Cloudinary public ID
        originalName: req.file.originalname,
        size: req.file.size,
      };

      console.log('Sending response:', result);
      return res.json(result);
    }

    const base64Payload = req.body?.imageBase64 || req.body?.imageDataUrl || req.body?.image;
    if (!base64Payload) {
      console.log('No file or base64 payload in request');
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    console.log('Processing base64 clipboard payload');
    const uploadOptions = {
      folder: req.body?.folder || DEFAULT_UPLOAD_FOLDER,
      transformation: DEFAULT_TRANSFORMATIONS,
      resource_type: 'image'
    };

    const uploaded = await cloudinary.uploader.upload(base64Payload, uploadOptions);

    const base64Result = {
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: uploaded.secure_url,
      publicId: uploaded.public_id,
      originalName: uploaded.original_filename,
      size: uploaded.bytes,
    };

    console.log('Sending response:', base64Result);
    res.json(base64Result);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Image upload failed',
      error: error.message,
    });
  }
});

// --------------------
// Delete Image Route
// --------------------
router.delete('/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'Image deleted successfully',
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found or already deleted',
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message,
    });
  }
});

// --------------------
// Error Handling Middleware
// --------------------
router.use((error, req, res, next) => {
  // Handle file size limit error
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 5MB.',
    });
  }

  // Handle file type error
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed!',
    });
  }

  // Generic error handler
  console.error('Upload middleware error:', error);
  res.status(500).json({
    success: false,
    message: 'Something went wrong during file upload',
    error: error.message,
  });
});

module.exports = router;
