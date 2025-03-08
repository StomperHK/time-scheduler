import express from "express"
import { config } from "dotenv"
import cors from "cors"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { sql } from "./lib/databaseConnection.js"

import { User } from "./models/User.js"

const app = express()

config()
app.use(process.env.PRODUCTION === "true" ? cors({origin: /vercel\.app$/}) : cors({ origin: "*" }))
app.use(express.json())

app.post("/auth/register", async (req, res) => {
  let {email, password} = req.body
  const userModel = new User(sql)

  if (!email || !password) {
    return res.status(422).json({message: "missing fields"})
  }
  if (password.length < 8) {
    return res.status(422).json({message: "short password"})
  }
  
  password = await bcrypt.hash(password, 10)

  try {
    const result = await userModel.createAccount(email, password)

    if (result) {
      return res.status(201).send()
    }

    return res.status(422).json({message: "email registered"})
  }
  catch (error) {
    return res.status(500).json({message: "server error"})
  }
})

app.post("/auth/login", async (req, res) => {
  let {email, password} = req.body
  const userModel = new User(sql)

  if (!email || !password) {
    return res.status(422).json({message: "missing fields"})
  }

  try {
    const result = await userModel.login(email, password)

    if (result) {
      return res.status(200).end()
    }

    res.status(404).json({message: "wrong login"})
  } 
  catch(error) {
    return res.status(500).json({message: "server error"})
  }
})

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running")
})
