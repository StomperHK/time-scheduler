import crypto from "node:crypto";

export function verifyWebhookSignature(req, res, next) {
  const dataId = req.query["data.id"];
  const requestWebhookSignatureRequestId = req.headers["x-request-id"];
  const requestWebhookSignatureTS = req.headers["x-signature"].split(",")[0].split("=")[1];
  const requestWebhookSingatureHash = req.headers["x-signature"].split(",")[1].split("=")[1];

  const signatureTemplate = `id:${dataId};request-id:${requestWebhookSignatureRequestId};ts:${requestWebhookSignatureTS}`;
  const cyphedSignature = crypto.createHmac("sha256", process.env.MP_WEBHOOK_SECRET).update(signatureTemplate).digest("hex");

  if (cyphedSignature === requestWebhookSingatureHash) {
    next()
    return
  }

  console.log("Unauthorized webhook access.")

  res.status(400).send()
}
