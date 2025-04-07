import { Router } from "express";

import { registerUser, loginUser, oAuthRegisterHandler } from "../controllers/authController.js";

const router = Router()

router.post("/auth/register", registerUser)

router.post("/auth/login", loginUser);

router.post("/auth/oauth-register", oAuthRegisterHandler);

export default router