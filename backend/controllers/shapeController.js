const Shape = require('../Modal/Shape');

// Create a new shape
exports.createShape = async (req, res, next) => {
  try {
    const { name, type, coordinates } = req.body;

    if (!name || !type || !coordinates) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const shape = await Shape.create({ name, type, coordinates });
    res.status(201).json({ message: 'Shape created', shape });
  } catch (err) {
    next(err);
  }
};
