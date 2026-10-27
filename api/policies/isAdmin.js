module.exports = function (req, res, proceed) {
  const user = req.session ? req.session.user : null;

  if (!user) {
    return res.forbidden({
      message: "Anda harus login terlebih dahulu.",
    });
  }

  if (user.role !== "admin") {
    return res.forbidden({
      message: "Anda tidak memiliki akses admin.",
    });
  }

  return proceed();
};
