import { sql } from "./databaseConnection.js";

try {
  await sql`
    CREATE TABLE Users (
      id TEXT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      isPremium BOOLEAN DEFAULT FALSE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `

  console.log("Table created");
} catch (error) {
  console.log(error);
}
