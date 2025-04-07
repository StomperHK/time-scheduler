import { sql } from "../lib/databaseConnection.js";
import { User } from "../models/User.js";

export async function getUserData(req, res) {
  const userId = req.authorization;
  const userModel = new User(sql);
  const sendUserData = req.query["send-user-data"] === "true";

  if (sendUserData) {
    res.status(200).json(await userModel.getUserData(userId));
  } else {
    res.status(204).send();
  }
}