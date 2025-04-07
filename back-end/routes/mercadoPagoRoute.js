import { Router } from "express"

import { createPreference, handleFeedback } from "../controllers/mercadoPagoController.js"
import { checkToken } from "../middlewares/checkToken.js";
import { verifyWebhookSignature } from "../middlewares/verifyWebhookSignature.js"

const router = Router()

router.post("/mercado-pago/create-preference", checkToken, createPreference)

router.post("/mercado-pago/feedback", verifyWebhookSignature, handleFeedback)

export default router