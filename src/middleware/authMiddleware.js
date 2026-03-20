function ensureAuthenticated(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/");
  }
  return next();
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.redirect("/");
    }

    if (!roles.includes(req.session.user.role)) {
      return res.status(403).render("auth/forbidden", {
        title: "Forbidden",
        user: req.session.user,
      });
    }

    return next();
  };
}

module.exports = {
  ensureAuthenticated,
  allowRoles,
};
