import express from 'express';
import reviewController from '../controller/review.controller.js';

const router = express.Router();

router.get('/', reviewController.get);

router.get('/:id', reviewController.get);

router.post('/', reviewController.create);

router.patch('/:id', reviewController.update);

router.delete('/:id', reviewController.remove);

export default router;
