import slugify from 'slugify';

const slugifyMiddleWare = (req, res, next) => {
  if (req.body.name) {
    req.body.slug = slugify(req.body.name);
  }
  next();
};

export default slugifyMiddleWare;
