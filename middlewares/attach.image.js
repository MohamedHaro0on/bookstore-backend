import expressAsyncHandler from 'express-async-handler';

const attachImage = (field) => expressAsyncHandler((req, _, next) => {
  if (req.file) {
    req.body[field] = req.file.filename;
  }
  next();
});

export default attachImage;
