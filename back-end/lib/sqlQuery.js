import { sql } from "./databaseConnection.js";

try {
  await sql`
    CREATE TYPE login_type_enum AS ENUM ('email/password', 'oauth');
    ALTER TABLE Users
    ADD COLUMN login_type login_type_enum;
  `;

  console.log("Query executed");
} catch (error) {
  console.log(error);
}
