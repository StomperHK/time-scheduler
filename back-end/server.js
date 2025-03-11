import express from "express";
import { config } from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";
import bcrypt from "bcrypt";
import { sql } from "./lib/databaseConnection.js";

import { User } from "./models/User.js";
import { checkToken } from "./middlewares/checkToken.js";

const app = express();
const isInProduction = process.env.PRODUCTION !== "false";

config();
app.use(isInProduction ? cors({ origin: /vercel\.app$/ }) : cors({ origin: "*" }));
app.use(express.json());

app.post("/auth/register", async (req, res) => {
  let { email, password } = req.body;
  const userModel = new User(sql);

  if (!email || !password) {
    return res.status(422).json({ message: "missing fields" });
  }
  if (password.length < 8) {
    return res.status(422).json({ message: "short password" });
  }

  password = await bcrypt.hash(password, 10);

  try {
    const userId = await userModel.createAccount(email, password);

    if (userId) {
      const secret = process.env.SECRET;
      const token = jwt.sign({ userId }, secret, { expiresIn: "7d" });
      return res.status(200).json({token});
    }

    return res.status(422).json({ message: "email registered" });
  } catch (error) {
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
    const userId = await userModel.login(email, password);
    
    if (userId) {
      const secret = process.env.SECRET;
      const token = jwt.sign({ userId }, secret, { expiresIn: "7d" });
      return res.status(200).json({token});
    }

    res.status(404).json({ message: "wrong login" });
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
});

app.get("/user", checkToken, async (req, res) => {
  const userId = req.authorization
  const userModel = new User(sql);
  const sendUserData = req.query["send-user-data"] === "true"

  if (sendUserData) {
    res.status(200).json(await userModel.getUserData(userId))
  }
  else {
    res.status(204).send()
  }
});

app.listen(process.env.PORT || 3000);
