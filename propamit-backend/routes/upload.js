const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const Application = require('../models/Application');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads/documents/';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, JPG, PNG) and documents (PDF, DOC, DOCX) are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter: fileFilter
});

// @desc    Upload document for application
// @route   POST /api/upload/document/:applicationId
// @access  Private
router.post('/document/:applicationId', protect, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      // Delete uploaded file if application not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user owns the application
    if (application.user.toString() !== req.user.id) {
      // Delete uploaded file if unauthorized
      fs.unlinkSync(req.file.path);
      return res.status(401).json({
        success: false,
        message: 'Not authorized to upload documents for this application'
      });
    }

    // Add document to application
    const document = {
      name: req.body.documentName || req.file.originalname,
      url: `/uploads/documents/${req.file.filename}`,
      uploadedAt: new Date()
    };

    application.documents.push(document);
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      document: document
    });
  } catch (error) {
    // Delete uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error uploading document'
    });
  }
});

// @desc    Upload multiple documents
// @route   POST /api/upload/documents/:applicationId
// @access  Private
router.post('/documents/:applicationId', protect, upload.array('documents', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      // Delete uploaded files if application not found
      req.files.forEach(file => fs.unlinkSync(file.path));
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user owns the application
    if (application.user.toString() !== req.user.id) {
      // Delete uploaded files if unauthorized
      req.files.forEach(file => fs.unlinkSync(file.path));
      return res.status(401).json({
        success: false,
        message: 'Not authorized to upload documents for this application'
      });
    }

    // Add documents to application
    const documents = req.files.map((file, index) => ({
      name: req.body.documentNames ? req.body.documentNames[index] : file.originalname,
      url: `/uploads/documents/${file.filename}`,
      uploadedAt: new Date()
    }));

    application.documents.push(...documents);
    await application.save();

    res.status(200).json({
      success: true,
      message: `${documents.length} documents uploaded successfully`,
      documents: documents
    });
  } catch (error) {
    // Delete uploaded files on error
    if (req.files) {
      req.files.forEach(file => fs.unlinkSync(file.path));
    }
    
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error uploading documents'
    });
  }
});

// @desc    Delete document
// @route   DELETE /api/upload/document/:applicationId/:documentId
// @access  Private
router.delete('/document/:applicationId/:documentId', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user owns the application or is admin/agent
    if (application.user.toString() !== req.user.id && 
        !['admin', 'agent'].includes(req.user.role)) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete documents for this application'
      });
    }

    // Find and remove document
    const documentIndex = application.documents.findIndex(
      doc => doc._id.toString() === req.params.documentId
    );

    if (documentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const document = application.documents[documentIndex];
    
    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', document.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove document from application
    application.documents.splice(documentIndex, 1);
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting document'
    });
  }
});

// @desc    Get document (serve file)
// @route   GET /api/upload/document/:filename
// @access  Private
router.get('/document/:filename', protect, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'uploads', 'documents', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';

    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
    }

    res.setHeader('Content-Type', contentType);
    res.sendFile(filePath);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving document'
    });
  }
});

module.exports = router;