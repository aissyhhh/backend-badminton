const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
  login: async function (req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: 'Email dan password wajib diisi'
        });
      }

      const user = await User.findOne({
        email: email.toLowerCase()
      });

      if (!user) {
        return res.status(401).json({
          message: 'Email atau password salah'
        });
      }

      const cocok = await bcrypt.compare(password, user.password);

      if (!cocok) {
        return res.status(401).json({
          message: 'Email atau password salah'
        });
      }

      if (user.status_akun !== 'aktif') {
        return res.status(403).json({
          message: 'Akun kamu sedang dinonaktifkan. Hubungi admin.'
        });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        sails.config.custom.jwtSecret,
        { expiresIn: sails.config.custom.jwtExpiresIn }
      );

      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      return res.json({
        message: 'Login berhasil',
        token,
        user: userData
      });

    } catch (error) {
      sails.log.error(error);

      return res.serverError({
        message: 'Terjadi kesalahan saat login'
      });
    }
  },

  me: async function (req, res) {
    return res.json({ user: req.me });
  }
};