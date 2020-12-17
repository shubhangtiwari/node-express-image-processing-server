const { Router } = require('express');
const imageProcessor = require('./imageProcessor');
const path = require('path');
const multer = require('multer');
const { response } = require('../app');
const router = Router();
const photoPath = path.resolve(__dirname, '../../client/photo-viewer.html');

const filename = (request, file, callback) => {
  callback(null, file.originalname);
};

const storage = multer.diskStorage({
  destination: 'api/uploads/',
  filename: filename
});

const fileFilter = (request, file, callback) => {
  if (file.mimetype !== 'image/png') {
    request.fileValidationError = 'Wrong file type';
    callback(null, false, new Error('Wrong file type'));
  } else {
    callback(null, true);
  }
};

const upload = multer({
  fileFilter: fileFilter,
  storage: storage
});

router.post('/upload', upload.single('photo'), async (request, response) => {
  if (request.fileValidationError) {
    return response.status(400).json({
      error: request.fileValidationError
    });
  }

  try {
    await imageProcessor(request.file.filename);
  } catch (e) {}

  return response.status(201).json({
    success: true
  });
});

router.get('/photo-viewer', (request, response) => {
  response.sendFile(photoPath);
});

module.exports = router;
