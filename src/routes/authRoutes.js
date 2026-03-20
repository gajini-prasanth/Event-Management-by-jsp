const express = require("express");
const { renderLogin, login, logout, registerUser } = require("../controllers/authController");
const { ensureAuthenticated, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/login", renderLogin);
router.post("/login", login);
router.post("/logout", ensureAuthenticated, logout);
router.post("/register", ensureAuthenticated, allowRoles("Admin"), registerUser);

module.exports = router;
