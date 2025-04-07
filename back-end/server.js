import express from "express";
import { config } from "dotenv";
import cors from "cors";

import authRoute from "./routes/authRoute.js"
import userRoute from "./routes/userRoute.js"
import mercadoPagoRoute from "./routes/mercadoPagoRoute.js"

const app = express();
const port = process.env.PORT || 3000;


const isInProduction = process.env.PRODUCTION !== "false";

config();
app.use(isInProduction ? cors({ origin: ["https://api.mercadopago.com/", /vercel\.app$/] }) : cors({ origin: "*" }));
app.use(express.json());

app.use(authRoute)
app.use(userRoute)
app.use(mercadoPagoRoute)

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port: ${port}`);
});
