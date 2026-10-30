module.exports = {
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

            const pendaftaran = await Pendaftaran.findOne({
                id: Number(pendaftaran_id),
            });

            if (!pendaftaran) {
                return res.notFound({
                    message: 'Pendaftaran tidak ditemukan',
                });
            }

            const kelas = await KelasTurnamen.findOne({
                id: pendaftaran.kelas_turnamen_id,
            });

            if (!kelas || Number(kelas.turnamen_id) !== Number(turnamenId)) {
                return res.badRequest({
                    message: 'Pendaftaran bukan milik turnamen tersebut',
                });
            }

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

    uploadBukti: async function (req, res) {
        try {
            const { turnamenId, id } = req.params;

            const pembayaran = await Pembayaran.findOne({
                id: id
            });

            if (!pembayaran) {
                return res.status(404).json({
                    message: 'Data pembayaran tidak ditemukan'
                });
            }

            req.file('file').upload(
                {
                    dirname: require('path').resolve(
                        sails.config.appPath,
                        'assets/uploads/bukti-pembayaran'
                    ),
                    maxBytes: 5 * 1024 * 1024
                },
                async function (err, uploadedFiles) {
                    if (err) {
                        return res.serverError(err);
                    }

                    if (!uploadedFiles || uploadedFiles.length === 0) {
                        return res.status(400).json({
                            message: 'File bukti pembayaran wajib diunggah'
                        });
                    }

                    const file = uploadedFiles[0];

                    if (!file.type || !file.type.startsWith('image/')) {
                        return res.status(400).json({
                            message: 'Bukti pembayaran harus berupa gambar'
                        });
                    }

                    const fileName = require('path').basename(file.fd);
                    const filePath = `/uploads/bukti-pembayaran/${fileName}`;

                    const updated = await Pembayaran.updateOne({
                        id: id
                    }).set({
                        bukti_pembayaran: filePath
                    });

                    if (!updated) {
                        return res.status(404).json({
                            message: 'Gagal memperbarui bukti pembayaran'
                        });
                    }

                    return res.json({
                        message: 'Bukti pembayaran berhasil diunggah',
                        data: updated
                    });
                }
            );
        } catch (err) {
            return res.serverError(err);
        }
    },

    updateStatus: async function (req, res) {
        try {
            const { id, turnamenId } = req.params;
            const { status_pembayaran } = req.body;

            if (!['verified', 'rejected'].includes(status_pembayaran)) {
                return res.badRequest({
                    message: 'Status harus verified atau rejected.',
                });
            }

            const pembayaran = await Pembayaran.findOne({ id: Number(id) });

            if (!pembayaran) {
                return res.notFound({
                    message: 'Pembayaran tidak ditemukan.',
                });
            }

            if (pembayaran.status_pembayaran !== 'pending') {
                return res.badRequest({
                    message: 'Pembayaran sudah diproses.',
                });
            }

            const pendaftaran = await Pendaftaran.findOne({
                id: pembayaran.pendaftaran_id,
            });

            if (!pendaftaran) {
                return res.notFound({
                    message: 'Pendaftaran tidak ditemukan.',
                });
            }

            if (turnamenId) {
                const kelas = await KelasTurnamen.findOne({
                    id: pendaftaran.kelas_turnamen_id,
                });

                if (!kelas || Number(kelas.turnamen_id) !== Number(turnamenId)) {
                    return res.badRequest({
                        message: 'Pembayaran bukan milik turnamen tersebut.',
                    });
                }
            }

            const dataUpdate = {
                status_pembayaran,
            };

            if (status_pembayaran === 'verified') {
                dataUpdate.tanggal_pembayaran = new Date();
            }

            const hasil = await Pembayaran.updateOne({ id: pembayaran.id })
                .set(dataUpdate);

            let sinkronisasi = null;

            if (status_pembayaran === 'verified') {
                if (pendaftaran.status_pendaftaran !== 'confirmed') {
                    sinkronisasi = {
                        berhasil: false,
                        message: 'Pembayaran terverifikasi, tetapi pendaftaran belum dikonfirmasi.',
                    };
                } else {
                    const pesertaList = await PesertaPendaftaran.find({
                        pendaftaran_id: pendaftaran.id,
                    });

                    if (pesertaList.length === 0) {
                        return res.badRequest({
                            message: 'Pendaftaran belum memiliki peserta.',
                        });
                    }

                    for (const peserta of pesertaList) {
                        if (!peserta.nik || !peserta.nik.trim()) {
                            return res.badRequest({
                                message: `NIK peserta ${peserta.nama_lengkap} wajib diisi.`,
                            });
                        }

                        const nik = peserta.nik.trim();

                        let player = await Player.findOne({ nik });

                        if (!player && peserta.player_id) {
                            player = await Player.findOne({
                                id: peserta.player_id,
                            });
                        }

                        if (!player) {
                            player = await Player.create({
                                nama: peserta.nama_lengkap,
                                nik,
                                gambar_diri: peserta.foto_peserta || undefined,
                            }).fetch();
                        }

                        if (peserta.player_id !== player.id) {
                            await PesertaPendaftaran.updateOne({
                                id: peserta.id,
                            }).set({
                                player_id: player.id,
                            });
                        }
                    }

                    sinkronisasi = {
                        berhasil: true,
                        jumlah: pesertaList.length,
                        message: 'Data peserta berhasil disinkronkan ke Player.',
                    };
                }
            }

            return res.json({
                message: 'Status pembayaran berhasil diperbarui.',
                data: hasil,
                sinkronisasi,
            });
        } catch (err) {
            sails.log.error('Gagal memperbarui status pembayaran:', err);

            return res.serverError({
                message: 'Gagal memperbarui status pembayaran.',
                error: err.message,
            });
        }
    },

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