module.exports = {
    async find(req, res) {
        try {
            const data = await KelasTurnamen.find()
                .populate('turnamen_id');

            return res.ok(data);
        } catch (error) {
            return res.serverError(error);
        }
    },

    async findOne(req, res) {
        try {
            const data = await KelasTurnamen.findOne({
                id: req.params.id,
            }).populate('turnamen_id');

            if (!data) {
                return res.notFound({
                    message: 'Kelas turnamen tidak ditemukan.',
                });
            }

            return res.ok(data);
        } catch (error) {
            return res.serverError(error);
        }
    },

    async create(req, res) {
        try {
            const turnamenId = req.params.turnamenId;

            const turnamen = await Turnamen.findOne({
                id: turnamenId,
            });

            if (!turnamen) {
                return res.notFound({
                    message: 'Turnamen tidak ditemukan.',
                });
            }

            const {
                sektor,
                kategori_usia,
                harga,
                kapasitas,
            } = req.body;

            if (
                !sektor ||
                !kategori_usia ||
                harga == null ||
                kapasitas == null
            ) {
                return res.badRequest({
                    message: 'Sektor, kategori usia, harga, dan kapasitas peserta wajib diisi.',
                });
            }

            if (
                !Number.isInteger(Number(kapasitas)) ||
                Number(kapasitas) < 1
            ) {
                return res.badRequest({
                    message: 'Kapasitas peserta harus berupa bilangan bulat minimal 1.',
                });
            }

            const data = await KelasTurnamen.create({
                turnamen_id: turnamenId,
                sektor,
                kategori_usia,
                harga,
                kapasitas: Number(kapasitas),
            }).fetch();

            return res.status(201).json(data);
        } catch (error) {
            return res.serverError(error);
        }
    },

    async update(req, res) {
        try {
            const { turnamenId, kelasId } = req.params;

            const kelas = await KelasTurnamen.findOne({
                id: kelasId,
                turnamen_id: turnamenId,
            });

            if (!kelas) {
                return res.notFound({
                    message: 'Kelas tidak ditemukan dalam turnamen tersebut.',
                });
            }

            const kapasitas = req.body.kapasitas;

            if (
                kapasitas !== undefined &&
                (
                    !Number.isInteger(Number(kapasitas)) ||
                    Number(kapasitas) < 1
                )
            ) {
                return res.badRequest({
                    message: 'Kapasitas peserta harus berupa bilangan bulat minimal 1.',
                });
            }

            const data = await KelasTurnamen.updateOne({
                id: kelasId,
            }).set({
                sektor: req.body.sektor ?? kelas.sektor,
                kategori_usia: req.body.kategori_usia ?? kelas.kategori_usia,
                harga: req.body.harga ?? kelas.harga,
                kapasitas:
                    kapasitas === undefined
                        ? kelas.kapasitas
                        : Number(kapasitas),
            });

            return res.ok(data);
        } catch (error) {
            return res.serverError(error);
        }
    },

    async delete(req, res) {
        try {
            const { turnamenId, kelasId } = req.params;

            const kelas = await KelasTurnamen.findOne({
                id: kelasId,
                turnamen_id: turnamenId,
            });

            if (!kelas) {
                return res.notFound({
                    message: 'Kelas tidak ditemukan dalam turnamen tersebut.',
                });
            }

            await KelasTurnamen.destroyOne({
                id: kelasId,
            });

            return res.ok({
                message: 'Kelas turnamen berhasil dihapus.',
            });
        } catch (error) {
            return res.serverError(error);
        }
    },

    async findByTurnamen(req, res) {
        try {
            const turnamenId = req.params.turnamenId;

            const turnamen = await Turnamen.findOne({
                id: turnamenId,
            });

            if (!turnamen) {
                return res.notFound({
                    message: 'Turnamen tidak ditemukan.',
                });
            }

            const data = await KelasTurnamen.find({
                turnamen_id: turnamenId,
            });

            return res.ok(data);
        } catch (error) {
            return res.serverError(error);
        }
    },
};