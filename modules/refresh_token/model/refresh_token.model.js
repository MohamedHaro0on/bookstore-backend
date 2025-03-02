import mongoose from "mongoose";
import RefreshTokenSchema from "../schema/refresh_token.schema.js";

const RefreshToken = mongoose.model("RefreshToken", RefreshTokenSchema);
export default RefreshToken;
