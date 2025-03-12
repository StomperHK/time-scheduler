import jwt from "jsonwebtoken"
import { jwtDecode } from "jwt-decode"

export function checkToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(401).send()
  }

  try {
    if (jwt.verify(token, process.env.SECRET)) {
      req.authorization = jwtDecode(token).userId
      next()
    }
  }
  catch (error) {
    return res.status(422).send()
  }
}
