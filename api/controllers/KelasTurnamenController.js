module.exports = {
    async find(req, res) {
        try {
            const data = await KelasTurnamen.find().populate("turnamen_id");
            return res.ok(data);
        } catch (error) {
            return res.serverError(error);
        }
    },

    async findOne(req, res) {
        try {
            const data = await KelasTurnamen.findOne({
                id: req.params.id,
            }).populate("turnamen_id");

            if (!data) {
                return res.notFound({
                    message: "Kelas turnamen tidak ditemukan.",
                });
            }

            return res.ok(data);
        } catch (error) {
            return res.serverError(error);
        }
    },

    async create(req, res) {
        try {
            const turnamen = await Turnamen.findOne({
                id: req.body.turnamen_id,
            });

            if (!turnamen) {
                return res.badRequest({
                    message: "Turnamen tidak ditemukan.",
                });
            }

            const data = await KelasTurnamen.create({
                turnamen_id: req.body.turnamen_id,
                sektor: req.body.sektor,
                kategori_usia: req.body.kategori_usia,
                harga: req.body.harga,
            }).fetch();

            return res.status(201).json(data);
        } catch (error) {
            return res.serverError(error);
        }
    },

    async update(req, res) {
        try {
            const data = await KelasTurnamen.updateOne({
                id: req.params.id,
            }).set(req.body);

            if (!data) {
                return res.notFound({
                    message: "Kelas turnamen tidak ditemukan.",
                });
            }

            return res.ok(data);
        } catch (error) {
            return res.serverError(error);
        }
    },

    async delete(req, res) {
        try {
            const data = await KelasTurnamen.destroyOne({
                id: req.params.id,
            });

            if (!data) {
                return res.notFound({
                    message: "Kelas turnamen tidak ditemukan.",
                });
            }

            return res.ok({
                message: "Kelas turnamen berhasil dihapus.",
            });
        } catch (error) {
            return res.serverError(error);
        }
    },
};
