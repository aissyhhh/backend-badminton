module.exports = {
    async find(req, res) {
        try {
            const data = await Turnamen.find()
                .populate("kelas_turnamen")
                .sort("id DESC");

            return res.ok(data);
        } catch (error) {
            return res.serverError(error);
        }
    },

    async findOne(req, res) {
        try {
            const { id, slug } = req.params;

            const criteria = id ? { id } : { slug };

            const data = await Turnamen.findOne(criteria)
                .populate("kelas_turnamen");

            if (!data) {
                return res.notFound({
                    message: "Turnamen tidak ditemukan.",
                });
            }

            return res.ok(data);
        } catch (error) {
            return res.serverError(error);
        }
    },
    async create(req, res) {
        try {
            const data = await Turnamen.create({
                slug: req.body.slug,
                gambar: req.body.gambar,
                nama: req.body.nama,
                tanggal_mulai: req.body.tanggal_mulai,
                tanggal_berakhir: req.body.tanggal_berakhir,
                venue: req.body.venue,
                alamat: req.body.alamat,
                tlp: req.body.tlp,
                email: req.body.email,
                start_regist: req.body.start_regist,
                end_regist: req.body.end_regist,
                status: req.body.status || "akan_datang",
            }).fetch();

            return res.status(201).json(data);
        } catch (error) {
            return res.serverError(error);
        }
    },

    async update(req, res) {
        try {
            const data = await Turnamen.updateOne({
                id: req.params.id,
            }).set(req.body);

            if (!data) {
                return res.notFound({
                    message: "Turnamen tidak ditemukan.",
                });
            }

            return res.ok(data);
        } catch (error) {
            return res.serverError(error);
        }
    },

    async delete(req, res) {
        try {
            const data = await Turnamen.destroyOne({
                id: req.params.id,
            });

            if (!data) {
                return res.notFound({
                    message: "Turnamen tidak ditemukan.",
                });
            }

            return res.ok({
                message: "Turnamen berhasil dihapus.",
            });
        } catch (error) {
            return res.serverError(error);
        }
    },
};