import { Router } from "express";

import { getUserData } from "../controllers/userController.js";
import { checkToken } from "../middlewares/checkToken.js";

const router = Router()

router.get("/user", checkToken, getUserData);

export default router