require("dotenv").config();

const { createChainedHash } = require("../middleware/hashChain");
const { getLastUser, findUserByUsername, createUser } = require("../models/userModel");
const pool = require("../config/db");

async function main() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error("ADMIN_PASSWORD environment variable is required to seed admin.");
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }

  const existing = await findUserByUsername(username);
  if (existing) {
    // eslint-disable-next-line no-console
    console.log(`Admin user '${username}' already exists. Skipping seed.`);
    return;
  }

  const lastUser = await getLastUser();
  const previousHash = lastUser ? lastUser.PASSWORD_HASH : null;
  const { passwordHash, prevHash } = await createChainedHash(password, previousHash);

  await createUser({
    username,
    role: "Admin",
    passwordHash,
    prevHash,
  });

  // eslint-disable-next-line no-console
  console.log(`Admin user '${username}' created successfully.`);
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Failed to seed admin:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
