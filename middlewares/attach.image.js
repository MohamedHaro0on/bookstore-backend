import expressAsyncHandler from "express-async-handler";
import ApiError from "../utils/api.error.js";
import { StatusCodes } from "http-status-codes";

const attachImage = (field) => expressAsyncHandler((req, _, next) => {
    if (!req.body[field]) {
        next()
    }
    else if (req.body[field] && !req.file) {
        next(new ApiError("Please Reupload your photo", StatusCodes.BAD_REQUEST))
    }
    else {
        req.body[field] = req.file.filename;
        next()
    }

})


export default attachImage;