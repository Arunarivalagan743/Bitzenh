const express = require('express');
const { cloudinary, upload } = require('../config/cloudinary');
const router = express.Router();

// --------------------
// Upload Image Route
// --------------------
router.post('/', upload.single('image'), async (req, res) => {
  try {
    console.log('Upload route hit');
    console.log('File received:', req.file ? 'Yes' : 'No');
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

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
    res.json(result);
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
