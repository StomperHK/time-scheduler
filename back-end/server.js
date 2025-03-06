import express from "express"
import { config } from "dotenv"
import cors from "cors"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { sql } from "./lib/databaseConnection.js"

const server = express()


config()
server.use(process.env.PRODUCTION === "true" ? cors({origin: /vercel\.app$/}) : cors({ origin: "*" }))

server.listen(process.env.PORT || 3000, () => {
  console.log("Server is running")
})
