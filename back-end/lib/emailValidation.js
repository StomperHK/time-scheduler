import {resolveMx} from "node:dns"

export function isEmailFormatValid(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function resolveMxPromise(email) {
  const domain = email.split("@")[1]
  return new Promise((resolve, reject) => {
    resolveMx(domain, (err, adressess) => {
      if (err || adressess.length === 0) {
        resolve({status: "invalid hostname"})
      }
      else resolve({status: "success"})
    })
  })
}