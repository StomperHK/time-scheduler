import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";

import { isEmailFormatValid, resolveMxPromise } from "../lib/emailValidation.js";
import { sql } from "../lib/databaseConnection.js";
import { User } from "../models/User.js";

const oAuthClient = new OAuth2Client();

export async function registerUser(req, res) {
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
}

export async function loginUser(req, res) {
  let { email, password } = req.body;
  const userModel = new User(sql);

  if (!email || !password) {
    return res.status(422).json({ message: "missing fields" });
  }

  try {
    const result = await userModel.login(email, password);

    if (result.userId) {
      console.log(result.userId)
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
}

export async function oAuthRegisterHandler(req, res) {
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
}
