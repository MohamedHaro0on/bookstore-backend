import express from 'express';
import validateRequest from '../../../middlewares/validate.request.js';
import reviewController from '../controller/review.controller.js';
import { createReviewSchema, deleteReviewSchema, getReviewByIdSchema, updateReviewSchema } from '../validation/review.validation.js';
import authenticateUser from '../../../middlewares/authicate.user.js';

const router = express.Router();

router.get('/', reviewController.get);

router.get('/:id', validateRequest(getReviewByIdSchema), reviewController.get);

router.post('/', authenticateUser, validateRequest(createReviewSchema), reviewController.create);

router.patch('/:id', authenticateUser, validateRequest(updateReviewSchema), reviewController.update);

router.delete('/:id', authenticateUser, validateRequest(deleteReviewSchema), reviewController.remove);

export default router;
