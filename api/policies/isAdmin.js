module.exports = function (req, res, proceed) {
  if (req.me && req.me.role === 'admin') return proceed();
  return res.status(403).json({ message: 'Hanya admin yang boleh mengakses' });
};
