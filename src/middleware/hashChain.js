const bcrypt = require("bcryptjs");

const GENESIS_HASH = "GENESIS";

async function createChainedHash(password, previousHash) {
  const chainInput = previousHash || GENESIS_HASH;
  const chainedPassword = `${password}${chainInput}`;
  const passwordHash = await bcrypt.hash(chainedPassword, 10);
  return {
    passwordHash,
    prevHash: previousHash || null,
  };
}

async function verifyChainedHash(inputPassword, prevHash, storedHash) {
  const chainInput = prevHash || GENESIS_HASH;
  return bcrypt.compare(`${inputPassword}${chainInput}`, storedHash);
}

module.exports = {
  GENESIS_HASH,
  createChainedHash,
  verifyChainedHash,
};
