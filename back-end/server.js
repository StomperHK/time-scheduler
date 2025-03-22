import express from "express";
import { config } from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcrypt";
import { sql } from "./lib/databaseConnection.js";
import { MercadoPagoConfig, Preference } from "mercadopago"

import { isEmailFormatValid, resolveMxPromise } from "./lib/emailValidation.js";
import { User } from "./models/User.js";
import { checkToken } from "./middlewares/checkToken.js";

const app = express();
const oAuthClient = new OAuth2Client();
const mercadoPagoClient = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN});
const isInProduction = process.env.PRODUCTION !== "false";

config();
app.use(isInProduction ? cors({ origin: /vercel\.app$/ }) : cors({ origin: "*" }));
app.use(express.json());

app.post("/auth/register", async (req, res) => {
  let { email, password, name } = req.body;
  const userModel = new User(sql);

  if (!email || !password || !name) {
    return res.status(422).json({ message: "missing fields" });
  }
  if (password.length < 8) {
    return res.status(422).json({ message: "short password" });
  }
  if (!isEmailFormatValid(email) || (await resolveMxPromise(email)).status === "invalid hostname") {
    return res.status(422).json({ message: "invalid email" });
  }

  if (name.length > 27) {
    name = name.slice(0, 27);
  }

  password = await bcrypt.hash(password, 10);

  try {
    const userId = await userModel.createAccountWithEmailPassword(email, password, name);

    if (userId) {
      const secret = process.env.SECRET;
      const token = jwt.sign({ userId }, secret, { expiresIn: "7d" });
      return res.status(200).json({ token, type: "email/password" });
    }

    return res.status(422).json({ message: "email registered" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error" });
  }
});

app.post("/auth/login", async (req, res) => {
  let { email, password } = req.body;
  const userModel = new User(sql);

  if (!email || !password) {
    return res.status(422).json({ message: "missing fields" });
  }

  try {
    const result = await userModel.login(email, password);

    if (result.userId) {
      const secret = process.env.SECRET;
      const token = jwt.sign({ userId: result.userId }, secret, { expiresIn: "7d" });
      return res.status(200).json({ token, type: "email/password" });
    }

    if (result.message === "account type is oauth") {
      return res.status(422).json({ message: result.message});
    }

    if (result.message === "wrong login") {
      return res.status(404).json({ message: "wrong login" });
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "server error" });
  }
});

app.post("/auth/oauth-register", async (req, res) => {
  try {
    const oAuthCredentials = req.body;
    const ticket = await oAuthClient.verifyIdToken({
      idToken: oAuthCredentials.credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, given_name, picture } = ticket.getPayload();
    const userModel = new User(sql);
    const secret = process.env.SECRET;
    var userId = null;

    try {
      userId = await userModel.getUserIdWithEmail(email);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "server error" });
    }

    if (userId) {
      const token = jwt.sign({ userId }, secret, { expiresIn: "7d" });

      return res.status(200).json({ token, type: "oauth" });
    } else {
      try {
        const userId = await userModel.createAccountWithGoogle(email, given_name, picture);
        const token = jwt.sign({ userId }, secret, { expiresIn: "7d" });

        res.status(201).json({ token, type: "oauth" });
      } catch (error) {
        res.status(500).json({ message: "server error" });
      }
    }
  } catch (error) {
    console.log(error)
    res.status(404).send();
  }
});

app.get("/user", checkToken, async (req, res) => {
  const userId = req.authorization;
  const userModel = new User(sql);
  const sendUserData = req.query["send-user-data"] === "true";

  if (sendUserData) {
    res.status(200).json(await userModel.getUserData(userId));
  } else {
    res.status(204).send();
  }
});

app.post("/create-preference", checkToken, async (req, res) => {
  const newPreference = new Preference(mercadoPagoClient)
  const userId = req.authorization

  try {
    const preference = await newPreference.create({
      body: {
        items: [
          {
            title: 'Agendador de Horários Premium',
            quantity: 1,
            unit_price: 29
          }
        ],
        payer: {
          identification: {
            type: 'userId',
            number: String(userId)
          }
        }
      }
    })

    res.status(201)
    return res.json({id: preference.id})
  }
  catch (error) {
    console.log(error)
    res.status(500).json({ message: "server error" })
  }
})

app.post("/")

app.get("/verify-preference", async (req, res) => {
  const preferenceId = req.body.preferenceId

  try {
    const preference = await fetch(`https://api.mercadopago.com/checkout/preferences/${preferenceId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
      }
    })

    if (response.ok) {
      res.status(200)
      return res.send()
    }

    res.status(404).send()
  }
  catch (error) {
    console.log(error)
    res.status(500).json({ message: "server error" })
  }
})

app.post("/mercado-pago-feedback")

app.listen(3000);
