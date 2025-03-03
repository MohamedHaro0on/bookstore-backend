import mongoose from "mongoose";
import RefreshTokenSchema from "../schema/refresh_token.schema.js";

const RefreshTokenModel = mongoose.model("RefreshToken", RefreshTokenSchema);
export default RefreshTokenModel;
