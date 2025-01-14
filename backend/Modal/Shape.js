const mongoose = require('mongoose');

const shapeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['Point', 'LineString', 'Polygon'],
    required: true,
  },
  coordinates: {
    type: Array,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

// Geospatial index for fast querying
shapeSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Shape', shapeSchema);
