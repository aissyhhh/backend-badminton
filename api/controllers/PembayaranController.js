module.exports = {
    // GET /pembayaran
    // Menampilkan semua data pembayaran
    find: async function (req, res) {
        try {
            const pembayaran = await Pembayaran.find()
                .populate('pendaftaran_id')
                .sort('id DESC');

            return res.json(pembayaran);
        } catch (err) {
            sails.log.error(err);
            return res.serverError({
                message: 'Gagal mengambil data pembayaran',
            });
        }
    },

    // GET /pembayaran/:id
    // Menampilkan detail pembayaran
    findOne: async function (req, res) {
        try {
            const pembayaran = await Pembayaran.findOne({
                id: req.params.id,
            }).populate('pendaftaran_id');

            if (!pembayaran) {
                return res.notFound({
                    message: 'Data pembayaran tidak ditemukan',
                });
            }

            return res.json(pembayaran);
        } catch (err) {
            sails.log.error(err);
            return res.serverError({
                message: 'Gagal mengambil detail pembayaran',
            });
        }
    },

    // POST /turnamen/:turnamenId/pembayaran
    create: async function (req, res) {
        try {
            const { turnamenId } = req.params;
            const { pendaftaran_id, metode_pembayaran, bukti_pembayaran } = req.body;

            if (!pendaftaran_id || !metode_pembayaran) {
                return res.badRequest({
                    message: 'pendaftaran_id dan metode_pembayaran wajib diisi',
                });
            }

            const metodeValid = ['transfer', 'cash', 'ewallet', 'qris'];

            if (!metodeValid.includes(metode_pembayaran)) {
                return res.badRequest({
                    message: 'Metode pembayaran tidak valid',
                });
            }

            // Cari pendaftaran
            const pendaftaran = await Pendaftaran.findOne({
                id: Number(pendaftaran_id),
            });

            if (!pendaftaran) {
                return res.notFound({
                    message: 'Pendaftaran tidak ditemukan',
                });
            }

            // Pastikan pendaftaran milik turnamen pada URL
            const kelas = await KelasTurnamen.findOne({
                id: pendaftaran.kelas_turnamen_id,
            });

            if (!kelas || Number(kelas.turnamen_id) !== Number(turnamenId)) {
                return res.badRequest({
                    message: 'Pendaftaran bukan milik turnamen tersebut',
                });
            }

            // Ambil nominal dari total_biaya pendaftaran
            const nominal = Number(pendaftaran.total_biaya);

            if (!Number.isFinite(nominal) || nominal <= 0) {
                return res.badRequest({
                    message: 'Total biaya pendaftaran tidak valid',
                });
            }

            const pembayaran = await Pembayaran.create({
                pendaftaran_id: pendaftaran.id,
                metode_pembayaran,
                nominal,
                bukti_pembayaran: bukti_pembayaran || undefined,
                status_pembayaran: 'pending',
                status_refund: 'not_required',
                nominal_refund: 0,
            }).fetch();

            return res.status(201).json({
                message: 'Pembayaran berhasil ditambahkan',
                data: pembayaran,
            });
        } catch (err) {
            sails.log.error(err);
            return res.serverError({
                message: 'Gagal menambahkan pembayaran',
            });
        }
    },

    // PUT /pembayaran/:id/status
    // Memverifikasi atau menolak pembayaran
    updateStatus: async function (req, res) {
        try {
            const { status_pembayaran } = req.body;
            const statusValid = ['verified', 'rejected'];

            if (!statusValid.includes(status_pembayaran)) {
                return res.badRequest({
                    message: 'Status harus verified atau rejected',
                });
            }

            const pembayaran = await Pembayaran.findOne({
                id: req.params.id,
            });

            if (!pembayaran) {
                return res.notFound({
                    message: 'Data pembayaran tidak ditemukan',
                });
            }

            if (pembayaran.status_pembayaran !== 'pending') {
                return res.badRequest({
                    message: 'Pembayaran ini sudah diproses sebelumnya',
                });
            }

            const dataUpdate = {
                status_pembayaran,
            };

            if (status_pembayaran === 'verified') {
                dataUpdate.tanggal_pembayaran = new Date();
            }

            // Jika pembayaran ditolak, refund bisa diperlukan.
            if (status_pembayaran === 'rejected') {
                dataUpdate.status_refund = 'not_required';
            }

            const hasil = await Pembayaran.updateOne({
                id: pembayaran.id,
            }).set(dataUpdate);

            return res.json({
                message: 'Status pembayaran berhasil diperbarui',
                data: hasil,
            });
        } catch (err) {
            sails.log.error(err);
            return res.serverError({
                message: 'Gagal memperbarui status pembayaran',
            });
        }
    },

    // PUT /pembayaran/:id/refund
    // Mencatat pengembalian dana yang sudah dilakukan
    refund: async function (req, res) {
        try {
            const { nominal_refund } = req.body;

            if (
                nominal_refund === undefined ||
                nominal_refund === null ||
                nominal_refund === ''
            ) {
                return res.badRequest({
                    message: 'Nominal refund wajib diisi',
                });
            }

            const jumlahRefund = Number(nominal_refund);

            if (!Number.isFinite(jumlahRefund) || jumlahRefund <= 0) {
                return res.badRequest({
                    message: 'Nominal refund harus lebih dari 0',
                });
            }

            const pembayaran = await Pembayaran.findOne({
                id: req.params.id,
            }).populate('pendaftaran_id');

            if (!pembayaran) {
                return res.notFound({
                    message: 'Data pembayaran tidak ditemukan',
                });
            }

            if (pembayaran.status_pembayaran !== 'verified') {
                return res.badRequest({
                    message: 'Hanya pembayaran terverifikasi yang dapat direfund',
                });
            }

            if (
                !pembayaran.pendaftaran_id ||
                pembayaran.pendaftaran_id.status_pendaftaran !== 'rejected'
            ) {
                return res.badRequest({
                    message: 'Pendaftaran harus berstatus rejected untuk refund',
                });
            }

            if (
                pembayaran.status_refund === 'refunded' ||
                pembayaran.status_refund === 'processing'
            ) {
                return res.badRequest({
                    message: 'Refund sudah diproses atau diselesaikan',
                });
            }

            if (jumlahRefund > Number(pembayaran.nominal)) {
                return res.badRequest({
                    message: 'Nominal refund tidak boleh melebihi nominal pembayaran',
                });
            }

            // Pastikan dana sudah benar-benar dikembalikan secara manual
            // sebelum endpoint ini dipanggil.
            const hasil = await Pembayaran.updateOne({
                id: pembayaran.id,
            }).set({
                status_refund: 'refunded',
                nominal_refund: jumlahRefund,
                tanggal_refund: new Date(),
            });

            return res.json({
                message: 'Data refund berhasil dicatat',
                data: hasil,
            });
        } catch (err) {
            sails.log.error(err);
            return res.serverError({
                message: 'Gagal mencatat refund',
            });
        }
    },
};