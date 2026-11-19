const bcrypt = require('bcryptjs');

module.exports = {
    list: async function (req, res) {
        try {
            const where = {};

            if (req.query.role) {
                if (!['admin', 'wasit'].includes(req.query.role)) {
                    return res.badRequest({ message: 'Role tidak valid' });
                }

                where.role = req.query.role;
            }

            if (req.query.status_akun) {
                if (!['aktif', 'nonaktif'].includes(req.query.status_akun)) {
                    return res.badRequest({ message: 'Status akun tidak valid' });
                }

                where.status_akun = req.query.status_akun;
            }

            const users = await User.find(where).sort('id DESC');
            return res.json(users);
        } catch (err) {
            return res.serverError({ message: 'Gagal mengambil data akun' });
        }
    },

    detail: async function (req, res) {
        try {
            const user = await User.findOne({ id: req.params.id });

            if (!user) {
                return res.notFound({ message: 'User tidak ditemukan' });
            }

            return res.json(user);
        } catch (err) {
            return res.serverError({ message: 'Gagal mengambil detail akun' });
        }
    },

    create: async function (req, res) {
        try {
            const { name, email, password, role } = req.body;

            if (!name || !email || !password) {
                return res.badRequest({
                    message: 'Nama, email, dan password wajib diisi'
                });
            }

            const emailBersih = email.trim().toLowerCase();

            if (!['admin', 'wasit'].includes(role || 'wasit')) {
                return res.badRequest({ message: 'Role tidak valid' });
            }

            const sudahAda = await User.findOne({ email: emailBersih });

            if (sudahAda) {
                return res.status(409).json({
                    message: 'Email sudah terdaftar'
                });
            }

            const user = await User.create({
                name: name.trim(),
                email: emailBersih,
                password: await bcrypt.hash(password, 10),
                role: role || 'wasit',
                status_akun: 'aktif'
            }).fetch();

            return res.status(201).json(user);
        } catch (err) {
            return res.badRequest({
                message: 'Gagal menambahkan akun',
                detail: err.message
            });
        }
    },

    update: async function (req, res) {
        try {
            const { name, email, password, role, status_akun } = req.body;
            const data = {};

            if (name !== undefined) {
                if (!name.trim()) {
                    return res.badRequest({ message: 'Nama tidak boleh kosong' });
                }

                data.name = name.trim();
            }

            if (email !== undefined) {
                const emailBersih = email.trim().toLowerCase();

                const emailAda = await User.findOne({
                    email: emailBersih
                });

                if (emailAda && Number(emailAda.id) !== Number(req.params.id)) {
                    return res.status(409).json({
                        message: 'Email sudah digunakan akun lain'
                    });
                }

                data.email = emailBersih;
            }

            if (role !== undefined) {
                if (!['admin', 'wasit'].includes(role)) {
                    return res.badRequest({ message: 'Role tidak valid' });
                }

                data.role = role;
            }

            if (status_akun !== undefined) {
                if (!['aktif', 'nonaktif'].includes(status_akun)) {
                    return res.badRequest({ message: 'Status akun tidak valid' });
                }

                data.status_akun = status_akun;
            }

            if (password) {
                data.password = await bcrypt.hash(password, 10);
            }

            if (Object.keys(data).length === 0) {
                return res.badRequest({ message: 'Tidak ada data yang diubah' });
            }

            const user = await User.updateOne({
                id: req.params.id
            }).set(data);

            if (!user) {
                return res.notFound({ message: 'User tidak ditemukan' });
            }

            return res.json(user);
        } catch (err) {
            return res.badRequest({
                message: 'Gagal mengubah akun',
                detail: err.message
            });
        }
    },

    destroy: async function (req, res) {
        try {
            if (Number(req.params.id) === Number(req.me.id)) {
                return res.badRequest({
                    message: 'Tidak bisa menghapus akun sendiri'
                });
            }

            const user = await User.destroyOne({
                id: req.params.id
            });

            if (!user) {
                return res.notFound({ message: 'User tidak ditemukan' });
            }

            return res.json({ message: 'Akun berhasil dihapus' });
        } catch (err) {
            return res.serverError({
                message: 'Gagal menghapus akun',
                detail: err.message
            });
        }
    }
};
