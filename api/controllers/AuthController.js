const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
  login: async function (req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const cocok = await bcrypt.compare(password, user.password);
    if (!cocok) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      sails.config.custom.jwtSecret,
      { expiresIn: sails.config.custom.jwtExpiresIn }
    );

    return res.json({ message: 'Login berhasil', token, user });
  },

  me: async function (req, res) {
    return res.json({ user: req.me });
  }
};
