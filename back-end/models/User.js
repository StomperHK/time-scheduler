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

  async createAccountWithEmailPassword(email, hashedPassword, name) {
    if (!(await this.accountExists(email))) {
      const id = randomUUID()

      await this.#sql`
        INSERT INTO Users (id, email, password, name, created_at, login_type)
        VALUES (${id}, ${email}, ${hashedPassword}, ${name}, ${new Date()}, 'email/password')
      `

      return id
    }
  }

  async createAccountWithGoogle(email, name, picture) {
    const id = randomUUID()

    await this.#sql`
      INSERT INTO Users (id, email, name, picture, created_at, login_type)
      VALUES (${id}, ${email}, ${name}, ${picture}, ${new Date()}, 'oauth')
    `

    return id
  }

  async login(email, password) {
    const user = (await this.#sql`
      SELECT * FROM Users WHERE email = ${email}
    `)[0]
    
    if (user) {
      if (await bcrypt.compare(password, user.password)) {
        return {userId: user.id}
      }

      if (user.login_type === "oauth") return {message: "account created with oauth"}

      return {message: "wrong login"}
    }
  }

  async getUserData(userId) {
    const {name, picture, is_premium, created_at} = (await this.#sql`
      SELECT * FROM Users where id = ${userId}
    `)[0]

    return {name, picture, is_premium, created_at}
  }

  async getUserIdWithEmail(email) {
    const user = (await this.#sql`
      SELECT * FROM Users WHERE email = ${email}
    `)[0]

    return user?.id
  }
}