const express = require('express');
const multer = require('multer');
const { uploadFile, processFile, getFiles } = require('../controllers/fileController');

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /\.(geojson|kml|tiff)$/i;
    if (fileTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Please upload GeoJSON, KML, or TIFF.'));
    }
  },
});

// Routes
router.post('/upload', upload.single('file'), uploadFile); // Upload file
router.post('/process', processFile); // Process uploaded file
router.get('/', getFiles); // Get list of uploaded files

module.exports = router;
