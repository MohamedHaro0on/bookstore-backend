import mongoose from 'mongoose';
import reviewSchema from '../schema/review.schema.js';

const ReviewModel = mongoose.model('Review', reviewSchema);

export default ReviewModel;
