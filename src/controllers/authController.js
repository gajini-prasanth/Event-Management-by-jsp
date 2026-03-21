const jwt = require("jsonwebtoken");
const { createChainedHash, verifyChainedHash } = require("../middleware/hashChain");
const { getLastUser, findUserByUsername, createUser } = require("../models/userModel");

function renderLogin(req, res) {
  return res.render("auth/login", {
    title: "Login",
    error: req.query.error || null,
  });
}

async function registerUser(req, res) {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: "Username, password and role are required" });
    }

    const validRoles = ["Admin", "HelpDesk", "FoodDesk"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const lastUser = await getLastUser();
    const previousHash = lastUser ? lastUser.PASSWORD_HASH : null;
    const { passwordHash, prevHash } = await createChainedHash(password, previousHash);

    await createUser({
      username,
      role,
      passwordHash,
      prevHash,
    });

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed", error: error.message });
  }
}

async function login(req, res) {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.redirect("/auth/login?error=Please+fill+all+fields");
    }

    const user = await findUserByUsername(username);
    if (!user || user.Role !== role) {
      return res.redirect("/auth/login?error=Invalid+credentials+or+role");
    }

    const validPassword = await verifyChainedHash(password, user.prev_hash, user.PASSWORD_HASH);
    if (!validPassword) {
      return res.redirect("/auth/login?error=Invalid+credentials");
    }

    const token = jwt.sign(
      { id: user.ID, username: user.Username, role: user.Role },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "1d" }
    );

    req.session.user = {
      id: user.ID,
      username: user.Username,
      role: user.Role,
      token,
    };

    if (user.Role === "Admin") return res.redirect("/admin/dashboard");
    if (user.Role === "HelpDesk") return res.redirect("/helpdesk/scan");
    return res.redirect("/fooddesk/meals");
  } catch (error) {
    return res.redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
  }
}

function logout(req, res) {
  req.session.destroy(() => {
    res.redirect("/");
  });
}

module.exports = {
  renderLogin,
  registerUser,
  login,
  logout,
};
