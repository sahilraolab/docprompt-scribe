# Document File Upload Backend Implementation Guide

This guide provides complete backend implementation for handling document file uploads in the Engineering module.

## CRITICAL: Fix 404 Error for Document Downloads

**The 404 error when clicking download/eye icons happens because your Express server is not configured to serve static files.**

### Required Fix in server.js

Add this code in your `server.js` or `app.js` **BEFORE your routes**:

```javascript
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// CRITICAL: Enable CORS for frontend
app.use(cors({
  origin: 'http://localhost:8080', // Your frontend URL
  credentials: true
}));

// CRITICAL: Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Then add your routes...
app.use('/api', routes);
```

This allows files at `/uploads/documents/filename.pdf` to be accessible.

## 1. Install Required Dependencies

```bash
npm install multer
npm install @types/multer --save-dev
```

## 2. Create File Upload Middleware

Create `middleware/upload.js`:

```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// File filter - accept only specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/dwg',
    'application/dxf'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, images, Excel, Word, and CAD files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  }
});

module.exports = upload;
```

## 3. Update Document Controller

Update `controllers/documentController.js`:

```javascript
const Document = require('../models/Document');
const Project = require('../models/Project');
const path = require('path');
const fs = require('fs');

// Upload document with file
exports.createDocument = async (req, res) => {
  try {
    const { projectId, name, type, version, description } = req.body;

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Mark previous versions as not latest
    if (name && type) {
      await Document.updateMany(
        { 
          projectId: projectId,
          name: name,
          type: type
        },
        { isLatest: false }
      );
    }

    // Create document records for each uploaded file
    const documents = [];
    for (const file of req.files) {
      const document = new Document({
        projectId,
        name: name || file.originalname,
        type,
        version: parseInt(version) || 1,
        url: `/uploads/documents/${file.filename}`, // Relative path
        size: file.size,
        mimeType: file.mimetype,
        uploadedBy: req.user.id,
        createdBy: req.user.id,
        description: description || undefined
      });

      await document.save();
      documents.push(document);
    }
    
    res.status(201).json({
      success: true,
      data: documents.length === 1 ? documents[0] : documents,
      message: `${documents.length} document(s) uploaded successfully`
    });
  } catch (error) {
    // Clean up uploaded files if document creation fails
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    res.status(400).json({ error: error.message });
  }
};

// Delete document (including file)
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete the physical file
    if (document.url) {
      const filePath = path.join(__dirname, '..', document.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await document.deleteOne();
    res.json({ success: true, message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Download document
exports.downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const filePath = path.join(__dirname, '..', document.url);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.download(filePath, document.name);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all documents (existing code remains the same)
exports.getAllDocuments = async (req, res) => {
  try {
    const { type, projectId, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (projectId) query.projectId = projectId;

    const total = await Document.countDocuments(query);
    const documents = await Document.find(query)
      .populate('projectId', 'name code')
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      data: documents,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Other methods remain the same...
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('projectId')
      .populate('uploadedBy', 'name email')
      .populate('createdBy', 'name');

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDocumentsByProject = async (req, res) => {
  try {
    const { type, isLatest } = req.query;
    const query = { projectId: req.params.projectId };
    
    if (type) query.type = type;
    if (isLatest !== undefined) query.isLatest = isLatest === 'true';

    const documents = await Document.find(query)
      .populate('uploadedBy', 'name')
      .sort({ type: 1, version: -1 });

    res.json({ data: documents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        tags: req.body.tags
      },
      { new: true, runValidators: true }
    );

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ success: true, data: document });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
```

## 4. Update Document Routes

Update `routes/documentRoutes.js`:

```javascript
const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const upload = require('../middleware/upload');

router.use(authenticate);

router.get('/', documentController.getAllDocuments);
router.get('/:id', documentController.getDocumentById);
router.get('/by-project/:projectId', documentController.getDocumentsByProject);
router.get('/:id/download', documentController.downloadDocument);

// File upload - use multer middleware
router.post('/', 
  authorize(['admin', 'engineer', 'project_manager']), 
  upload.array('files', 10), // Accept up to 10 files
  documentController.createDocument
);

router.put('/:id', 
  authorize(['admin', 'engineer', 'project_manager']), 
  documentController.updateDocument
);

router.delete('/:id', 
  authorize(['admin', 'project_manager']), 
  documentController.deleteDocument
);

module.exports = router;
```

## 5. Serve Static Files

Update `server.js` to serve uploaded files:

```javascript
const express = require('express');
const path = require('path');

// ... existing code ...

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ... rest of your server code ...
```

## 6. Add to .gitignore

Add to `.gitignore`:

```
# Uploaded files
uploads/
```

## 7. Optional: Cloud Storage (AWS S3)

For production, consider using AWS S3 instead of local storage.

Install dependencies:
```bash
npm install aws-sdk multer-s3
```

Update `middleware/upload.js` for S3:

```javascript
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');

// Configure AWS S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'documents/' + uniqueSuffix + '-' + file.originalname);
    }
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

module.exports = upload;
```

Add to `.env`:
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=your_bucket_name
```

## 8. Testing

Test file upload with curl:

```bash
curl -X POST http://localhost:5005/api/engineering/documents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "projectId=PROJECT_ID" \
  -F "name=Floor Plan" \
  -F "type=Drawing" \
  -F "version=1" \
  -F "description=First floor layout" \
  -F "files=@/path/to/file.pdf"
```

## Summary

This implementation:
- ✅ Accepts multiple file uploads
- ✅ Validates file types and size
- ✅ Stores files locally (or on S3)
- ✅ Creates database records with file metadata
- ✅ Handles file download
- ✅ Cleans up files on delete
- ✅ Supports version management
- ✅ Protected by authentication and authorization

The frontend is already configured to send FormData with files to this endpoint.
