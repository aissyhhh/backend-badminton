const jwt = require('jsonwebtoken');

module.exports = async function (req, res, proceed) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan, silakan login' });
  }

  try {
    const decoded = jwt.verify(token, sails.config.custom.jwtSecret);
    const user = await User.findOne({ id: decoded.id });

    if (!user) {
      return res.status(401).json({ message: 'User tidak ditemukan' });
    }

    req.me = user;
    return proceed();
  } catch (err) {
    return res.status(401).json({ message: 'Token tidak valid atau kadaluarsa' });
  }
};
