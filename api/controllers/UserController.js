const bcrypt = require('bcryptjs');
const { update } = require('sails-mysql');

module.exports = {
    list: async function (req, res) {
        const where = {};
        if (req.query.role) where.role = req.query.role;
        const users = await User.find(where);
        return res.json(users);
    },

    detail: async function (req, res) {
        const user = await User.findOne({ id: req.params.id });
        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
        return res.json(user);
    },

    create: async function (req, res) {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, password wajib diisi' });
        }

        const sudahAda = await User.findOne({ email: email.toLowerCase() });
        if (sudahAda) {
            return res.status(409).json({ message: 'Email sudah terdaftar' });
        }

        try {
            const user = await User.create({
                name,
                email: email.toLowerCase(),
                password: await bcrypt.hash(password, 10),
                role: role || 'wasit'
            }).fetch();
            return res.status(201).json(user);
        } catch (err) {
            return res.status(400).json({ message: 'Data tidak valid', detail: err.messag })
        }
    },

    update: async function (req, res) {
        const { name, email, password, role } = req.body;
        const data = {};

        if (name) data.name = name;
        if (email) data.email = email.toLowerCase();
        if (role) data.role = role;
        if (password) data.password = await bcrypt.hash(password, 10);

        try {
            const user = await User.updateOne({ id: req.params.id }).set(data);
            if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
            return res.json(user);
        } catch (err) {
            return res.status(400).json({ message: 'Data tidak valid', detail: err.message });
        }
    },

    destroy: async function (req, res) {
    if (Number(req.params.id) === req.me.id) {
      return res.status(400).json({ message: 'Tidak bisa menghapus akun sendiri' });
    }
    const user = await User.destroyOne({ id: req.params.id });
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    return res.json({ message: 'User dihapus' });
  }
};

