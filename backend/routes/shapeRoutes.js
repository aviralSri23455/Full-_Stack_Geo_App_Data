const express = require('express');
const { createShape } = require('../controllers/shapeController');

const router = express.Router();

// Route to create a new shape
router.post('/', createShape);

module.exports = router;
