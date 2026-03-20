const { listMealRows, updateFoodDeskStatus } = require("../models/mealModel");
const { getTeamMembersByTeamName } = require("../models/studentModel");

async function renderMealsPage(req, res) {
  const rows = await listMealRows();
  const search = (req.query.search || "").trim();
  const selectedTeam = (req.query.team || "").trim();
  const filteredRows = search
    ? rows.filter((row) => (row.Team_Name || "").toLowerCase().includes(search.toLowerCase()))
    : rows;

  const selectedTeamMembers = selectedTeam ? await getTeamMembersByTeamName(selectedTeam) : [];

  return res.render("fooddesk/meals", {
    title: "Food Desk",
    user: req.session.user,
    rows: filteredRows,
    search,
    selectedTeam,
    selectedTeamMembers,
    message: req.query.message || null,
    error: req.query.error || null,
  });
}

async function updateMeals(req, res) {
  try {
    const { id, morning, lunch, evening, search, team } = req.body;
    if (!id) {
      return res.redirect("/fooddesk/meals?error=Row+ID+required");
    }

    await updateFoodDeskStatus(id, {
      morning: morning === "on",
      lunch: lunch === "on",
      evening: evening === "on",
    });

    const searchQuery = search ? `&search=${encodeURIComponent(search)}` : "";
    const teamQuery = team ? `&team=${encodeURIComponent(team)}` : "";
    return res.redirect(`/fooddesk/meals?message=Meal+status+updated${searchQuery}${teamQuery}`);
  } catch (error) {
    const searchQuery = req.body.search ? `&search=${encodeURIComponent(req.body.search)}` : "";
    const teamQuery = req.body.team ? `&team=${encodeURIComponent(req.body.team)}` : "";
    return res.redirect(`/fooddesk/meals?error=${encodeURIComponent(error.message)}${searchQuery}${teamQuery}`);
  }
}

module.exports = {
  renderMealsPage,
  updateMeals,
};
