const { findStudentByQr } = require("../models/studentModel");

function renderScanPage(req, res) {
  return res.render("helpdesk/scan", {
    title: "Help Desk QR Scan",
    user: req.session.user,
    student: null,
    error: null,
  });
}

async function lookupByQr(req, res) {
  try {
    const { qrString } = req.body;
    if (!qrString) {
      return res.status(400).render("helpdesk/scan", {
        title: "Help Desk QR Scan",
        user: req.session.user,
        student: null,
        error: "QR string is required",
      });
    }

    const student = await findStudentByQr(qrString);
    if (!student) {
      return res.status(404).render("helpdesk/scan", {
        title: "Help Desk QR Scan",
        user: req.session.user,
        student: null,
        error: "Student not found for this QR",
      });
    }

    return res.render("helpdesk/scan", {
      title: "Help Desk QR Scan",
      user: req.session.user,
      student,
      error: null,
    });
  } catch (error) {
    return res.status(500).render("helpdesk/scan", {
      title: "Help Desk QR Scan",
      user: req.session.user,
      student: null,
      error: error.message,
    });
  }
}

module.exports = {
  renderScanPage,
  lookupByQr,
};
