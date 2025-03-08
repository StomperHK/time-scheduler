import {randomUUID} from "node:crypto"

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
        INSERT INTO Users (id, email, password)
        VALUES (${id}, ${email}, ${hashedPassword})
      `

      return true
    }
  }
}