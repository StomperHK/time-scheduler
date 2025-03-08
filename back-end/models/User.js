import {randomUUID} from "node:crypto"
import bcrypt from "bcrypt"

export class User {
  #sql = null

  constructor(sql) {
    this.#sql = sql
  }

  async accountExists(email) {
    const user = (await this.#sql`
      SELECT FROM Users WHERE email = ${email}
    `)[0]

    return user !== undefined
  }

  async createAccount(email, hashedPassword) {
    if (!(await this.accountExists(email))) {
      const id = randomUUID()

      await this.#sql`
        INSERT INTO Users (id, email, password, created_at)
        VALUES (${id}, ${email}, ${hashedPassword}, ${new Date()})
      `

      return true
    }
  }

  async login(email, password) {
    const user = (await this.#sql`
      SELECT * FROM Users WHERE email = ${email}
    `)[0]
    
    if (user) {
      return await bcrypt.compare(password, user.password)
    }
  }
}