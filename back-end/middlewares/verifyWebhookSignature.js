import crypto from "node:crypto";

export function verifyWebhookSignature(req, res, next) {
  const dataId = req.query["data.id"];
  const xRequestId = req.get("x-request-id")
  const xSignature = req.get('x-signature')
  const ts = xSignature.split(",")[0].split("=")[1];
  const hash = xSignature.split(",")[1].split("=")[1];

  const signatureTemplate = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const cyphedSignature = crypto.createHmac("sha256", process.env.MP_WEBHOOK_SECRET).update(signatureTemplate).digest("hex");

  console.log(`data id: ${dataId}; secret: ${process.env.MP_WEBHOOK_SECRET}`)

  if (cyphedSignature === hash) {
    next()
    return
  }

  console.log("Unauthorized webhook access.")

  res.status(400).send()
}
