require("dotenv").config({ override: true });
const path = require("path");
const express = require("express");
const session = require("express-session");
const cors = require("cors");

const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const helpDeskRoutes = require("./src/routes/helpDeskRoutes");
const foodDeskRoutes = require("./src/routes/foodDeskRoutes");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 },
  })
);
app.use(express.static(path.join(__dirname, "src/public")));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.get("/", (req, res) => {
  if (req.session.user) {
    if (req.session.user.role === "Admin") return res.redirect("/admin/dashboard");
    if (req.session.user.role === "HelpDesk") return res.redirect("/helpdesk/scan");
    return res.redirect("/fooddesk/meals");
  }
  return res.render("auth/login", {
    title: "Login",
    error: req.query.error || null,
  });
});

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/helpdesk", helpDeskRoutes);
app.use("/fooddesk", foodDeskRoutes);

app.use((req, res) => {
  res.status(404).render("auth/forbidden", {
    title: "Page Not Found",
    user: req.session.user || null,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
});
