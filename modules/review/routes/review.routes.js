import express from 'express';
import validateRequest from '../../../middlewares/validate.request.js';
import reviewController from '../controller/review.controller.js';
import {
    createReviewSchema,
    deleteReviewSchema,
    getReviewByIdSchema,
    updateReviewSchema
} from '../validation/review.validation.js';
import authenticateUser from '../../../middlewares/authenticate.user.js';

const reviewRouter = express.Router();

// Middleware object for cleaner code
const validate = {
    create: validateRequest(createReviewSchema),
    get: validateRequest(getReviewByIdSchema),
    update: validateRequest(updateReviewSchema),
    delete: validateRequest(deleteReviewSchema)
};

// Public routes
reviewRouter
    .route('/')
    .get(reviewController.get)
    .post(authenticateUser, validate.create, reviewController.create);

// Protected routes with ID
reviewRouter
    .route('/:id')
    .get(validate.get, reviewController.get)
    .patch(authenticateUser, validate.update, reviewController.update)
    .delete(authenticateUser, validate.delete, reviewController.remove);

export default reviewRouter;