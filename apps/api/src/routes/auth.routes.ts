import { Router } from "express";
import { loginRequestSchema } from "@smart-inv/shared-types";
import { validate } from "../middleware/validate.js";
import { auth } from "../middleware/auth.js";
import * as authController from "../controllers/auth.controller.js";

export const authRouter: Router = Router();

authRouter.post(
  "/login",
  validate(loginRequestSchema, "body"),
  authController.login
);

authRouter.get("/me", auth, authController.me);
