// routes/refreshToken.routes.js
import express from "express";
import validateRequest from "../middleware/validateRequest.js";
import { verifyJWT } from "../middleware/authicate.user.js";
import {
  refreshTokenSchema,
  revokeTokenSchema,
  getUserSessionsSchema,
} from "../validations/refreshToken.validation.js";
import {
  refreshAccessToken,
  getUserSessions,
  revokeSession,
  revokeAllSessions,
} from "../controllers/refreshToken.controller.js";

const router = express.Router();

// Public routes
router.post(
  "/refresh",
  validateRequest(refreshTokenSchema),
  refreshAccessToken
);

// Protected routes
router.use(verifyJWT);

// User routes
router.get(
  "/sessions",
  validateRequest(getUserSessionsSchema),
  getUserSessions
);

router.delete(
  "/sessions/:tokenId",
  validateRequest(revokeTokenSchema),
  revokeSession
);

router.delete("/sessions", revokeAllSessions);

export default router;
