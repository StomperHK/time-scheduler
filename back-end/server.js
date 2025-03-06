import express from "express"
import { config } from "dotenv"
import cors from "cors"

const server = express()

config()
server.use(process.env.PRODUCTION === "true" ? cors({origin: /vercel\.app$/}) : cors({ origin: "*" }))

server.listen(process.env.PORT || 3000, () => {
  console.log("Server is running")
})
