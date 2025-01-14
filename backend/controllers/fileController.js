// fileController.js
const uploadFile = (req, res) => {
    if (!req.file) {
      return res.status(400).send({ message: 'No file uploaded!' });
    }
    res.status(200).send({ message: 'File uploaded successfully!', file: req.file });
  };
  
  const processFile = (req, res) => {
    res.status(200).send({ message: 'File processed successfully!' });
  };
  
  const getFiles = (req, res) => {
    res.status(200).send({ message: 'List of uploaded files (placeholder)' });
  };
  
  module.exports = { uploadFile, processFile, getFiles };
  