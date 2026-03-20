const express = require("express");
const { renderMealsPage, updateMeals } = require("../controllers/foodDeskController");
const { ensureAuthenticated, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(ensureAuthenticated, allowRoles("FoodDesk"));

router.get("/meals", renderMealsPage);
router.post("/meals/update", updateMeals);

module.exports = router;
