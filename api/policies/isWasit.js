module.exports = function (req, res, proceed) {
  if (req.me && req.me.role === 'wasit') return proceed();
  return res.status(403).json({ message: 'Hanya wasit yang boleh mengakses' });
};
