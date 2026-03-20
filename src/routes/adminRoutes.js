const express = require("express");
const {
  renderDashboard,
  renderRegisterStudent,
  registerStudent,
  addEvent,
  editEvent,
  removeEvent,
  addMealConfig,
  editMealConfig,
  removeMealConfig,
} = require("../controllers/adminController");
const { ensureAuthenticated, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(ensureAuthenticated, allowRoles("Admin"));

router.get("/dashboard", renderDashboard);
router.get("/register-student", renderRegisterStudent);
router.post("/register-student", registerStudent);

router.post("/events/add", addEvent);
router.post("/events/edit", editEvent);
router.post("/events/delete/:id", removeEvent);

router.post("/meals/add", addMealConfig);
router.post("/meals/edit", editMealConfig);
router.post("/meals/delete/:id", removeMealConfig);

module.exports = router;
