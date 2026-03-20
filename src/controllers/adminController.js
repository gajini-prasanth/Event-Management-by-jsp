const crypto = require("crypto");
const QRCode = require("qrcode");
const nodemailer = require("nodemailer");
const { createStudent } = require("../models/studentModel");
const { listActiveEvents, createEvent, updateEvent, softDeleteEvent } = require("../models/eventModel");
const { listMealRows, createMealConfig, ensureMealTeamExists, updateMealConfig, deleteMealConfig } = require("../models/mealModel");

function buildQrString(student) {
  return `${student.name}|${student.contact || "NA"}|${student.eventName}|${student.teamName || "NA"}|${Date.now()}|${crypto.randomUUID()}`;
}

async function renderDashboard(req, res) {
  const [events, mealRows] = await Promise.all([listActiveEvents(), listMealRows()]);
  return res.render("admin/dashboard", {
    title: "Admin Dashboard",
    user: req.session.user,
    events,
    mealRows,
    message: req.query.message || null,
    error: req.query.error || null,
  });
}

async function renderRegisterStudent(req, res) {
  const events = await listActiveEvents();
  return res.render("admin/register-student", {
    title: "Register Student",
    user: req.session.user,
    events,
    generatedQr: null,
    error: req.query.error || null,
    message: req.query.message || null,
  });
}

async function registerStudent(req, res) {
  try {
    const { name, contact, eventName, teamName, teamMembers, email } = req.body;
    if (!name || !eventName || !teamName || !email) {
      return res.redirect("/admin/register-student?error=Name,+Event+Name,+Team+Name+and+Email+are+required");
    }

    const qrString = buildQrString({ name, contact, eventName, teamName });
    const qrBuffer = await QRCode.toBuffer(qrString, { type: "png", width: 400 });

    await createStudent({
      name,
      contact,
      qrString,
      eventName,
      teamName,
      teamMembers,
    });

    // Auto-add team into Meal Desk list when registered from student form.
    await ensureMealTeamExists(teamName);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    if (process.env.MAIL_USER && process.env.MAIL_PASS) {
      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: "College Event Registration QR",
        text: `Hi ${name}, your QR code for ${eventName} (Team: ${teamName}) is attached.`,
        attachments: [
          {
            filename: `${name.replace(/\s+/g, "_")}_qr.png`,
            content: qrBuffer,
          },
        ],
      });
    }

    const generatedQr = await QRCode.toDataURL(qrString, { width: 300 });
    const events = await listActiveEvents();

    return res.render("admin/register-student", {
      title: "Register Student",
      user: req.session.user,
      events,
      generatedQr,
      qrString,
      message: "Student registered successfully. QR generated and email sent if SMTP configured.",
      error: null,
    });
  } catch (error) {
    return res.redirect(`/admin/register-student?error=${encodeURIComponent(error.message)}`);
  }
}

async function addEvent(req, res) {
  try {
    const { eventName, blockName, blockImage, floorNo, classNo } = req.body;
    if (!eventName) {
      return res.redirect("/admin/dashboard?error=Event+name+is+required");
    }

    await createEvent({ eventName, blockName, blockImage, floorNo, classNo });
    return res.redirect("/admin/dashboard?message=Event+created");
  } catch (error) {
    return res.redirect(`/admin/dashboard?error=${encodeURIComponent(error.message)}`);
  }
}

async function editEvent(req, res) {
  try {
    const { eventId, blockName, blockImage, floorNo, classNo } = req.body;
    if (!eventId) return res.redirect("/admin/dashboard?error=Event+ID+required");

    await updateEvent(eventId, { blockName, blockImage, floorNo, classNo });
    return res.redirect("/admin/dashboard?message=Event+updated");
  } catch (error) {
    return res.redirect(`/admin/dashboard?error=${encodeURIComponent(error.message)}`);
  }
}

async function removeEvent(req, res) {
  try {
    await softDeleteEvent(req.params.id);
    return res.redirect("/admin/dashboard?message=Event+soft+deleted");
  } catch (error) {
    return res.redirect(`/admin/dashboard?error=${encodeURIComponent(error.message)}`);
  }
}

async function addMealConfig(req, res) {
  try {
    const { teamName, reqMorning, reqLunch, reqEvening } = req.body;
    if (!teamName) return res.redirect("/admin/dashboard?error=Team+name+is+required");

    await createMealConfig({
      teamName,
      reqMorning: reqMorning === "on",
      reqLunch: reqLunch === "on",
      reqEvening: reqEvening === "on",
    });

    return res.redirect("/admin/dashboard?message=Meal+config+added");
  } catch (error) {
    return res.redirect(`/admin/dashboard?error=${encodeURIComponent(error.message)}`);
  }
}

async function editMealConfig(req, res) {
  try {
    const { id, teamName, reqMorning, reqLunch, reqEvening } = req.body;
    if (!id || !teamName) return res.redirect("/admin/dashboard?error=Meal+config+ID+and+team+name+required");

    await updateMealConfig(id, {
      teamName,
      reqMorning: reqMorning === "on",
      reqLunch: reqLunch === "on",
      reqEvening: reqEvening === "on",
    });

    return res.redirect("/admin/dashboard?message=Meal+config+updated");
  } catch (error) {
    return res.redirect(`/admin/dashboard?error=${encodeURIComponent(error.message)}`);
  }
}

async function removeMealConfig(req, res) {
  try {
    await deleteMealConfig(req.params.id);
    return res.redirect("/admin/dashboard?message=Meal+config+deleted");
  } catch (error) {
    return res.redirect(`/admin/dashboard?error=${encodeURIComponent(error.message)}`);
  }
}

module.exports = {
  renderDashboard,
  renderRegisterStudent,
  registerStudent,
  addEvent,
  editEvent,
  removeEvent,
  addMealConfig,
  editMealConfig,
  removeMealConfig,
};
