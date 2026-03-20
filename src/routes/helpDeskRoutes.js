const express = require("express");
const { renderScanPage, lookupByQr } = require("../controllers/helpDeskController");
const { ensureAuthenticated, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(ensureAuthenticated, allowRoles("HelpDesk"));

router.get("/scan", renderScanPage);
router.post("/lookup", lookupByQr);

module.exports = router;
