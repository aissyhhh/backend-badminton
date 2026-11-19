const path = require('path');
const fs = require('fs');

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
            const { id } = req.params;
            const appSource = req.headers['x-app-source'];

            const pembayaran = await Pembayaran.findOne({
                id: Number(id)
            });

            if (!pembayaran) {
                return res.notFound({
                    message: 'Data pembayaran tidak ditemukan'
                });
            }

            const folderApp = {
                'frontend-1': 'shuttler',
                'frontend-2': 'shuttlehub',
            }[appSource];

            if (!folderApp) {
                return res.badRequest({
                    message: 'Identitas frontend tidak valid.'
                });
            }

            const uploadDir = path.join(
                sails.config.appPath,
                'uploads',
                folderApp,
                'bukti-pembayaran'
            );

            fs.mkdirSync(uploadDir, { recursive: true });

            req.file('file').upload(
                {
                    dirname: uploadDir,
                    maxBytes: 5 * 1024 * 1024
                },
                async function (err, uploadedFiles) {
                    if (err) {
                        return res.serverError({
                            message: 'Gagal upload bukti pembayaran.',
                            error: err.message
                        });
                    }

                    if (!uploadedFiles || uploadedFiles.length === 0) {
                        return res.badRequest({
                            message: 'File bukti pembayaran wajib diunggah'
                        });
                    }

                    const file = uploadedFiles[0];

                    const allowedTypes = [
                        'image/jpeg',
                        'image/png',
                        'image/webp'
                    ];

                    if (!allowedTypes.includes(file.type)) {
                        return res.badRequest({
                            message: 'Bukti pembayaran harus berupa JPG, PNG, atau WEBP'
                        });
                    }

                    const fileName = path.basename(file.fd);

                    const filePath =
                        `/uploads/${folderApp}/bukti-pembayaran/${fileName}`;

                    const updated = await Pembayaran.updateOne({
                        id: Number(id)
                    }).set({
                        bukti_pembayaran: filePath
                    });

                    if (!updated) {
                        return res.notFound({
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
            sails.log.error('Gagal upload bukti pembayaran:', err);

            return res.serverError({
                message: 'Terjadi kesalahan server.',
                error: err.message
            });
        }
    },

    serveBukti: async function (req, res) {
        try {
            const { folderApp, filename } = req.params;

            const allowedApps = ['shuttlehub', 'shuttler'];

            if (!allowedApps.includes(folderApp)) {
                return res.badRequest({
                    message: 'Folder aplikasi tidak valid.'
                });
            }

            const safeFilename = path.basename(filename);

            const uploadDir = path.resolve(
                sails.config.appPath,
                'uploads',
                folderApp,
                'bukti-pembayaran'
            );

            const filePath = path.resolve(uploadDir, safeFilename);

            if (!filePath.startsWith(uploadDir + path.sep)) {
                return res.badRequest({
                    message: 'Lokasi file tidak valid.'
                });
            }

            if (!fs.existsSync(filePath)) {
                return res.notFound({
                    message: 'File bukti pembayaran tidak ditemukan.'
                });
            }

            return res.sendFile(filePath);

        } catch (err) {
            sails.log.error('Gagal menampilkan bukti pembayaran:', err);

            return res.serverError({
                message: 'Gagal menampilkan bukti pembayaran.'
            });
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
                try {
                    sinkronisasi =
                        await sails.helpers.sinkronisasiPesertaPendaftaran(
                            Number(pendaftaran.id),
                        );
                } catch (err) {
                    sails.log.error('Gagal sinkronisasi peserta:', err);

                    sinkronisasi = {
                        berhasil: false,
                        message: err.message,
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
        const { id, turnamenId } = req.params;

        const pembayaran = await Pembayaran.findOne({
            id: Number(id),
        }).populate('pendaftaran_id');

        if (!pembayaran) {
            return res.notFound({
                message: 'Data pembayaran tidak ditemukan.',
            });
        }

        if (pembayaran.status_pembayaran !== 'verified') {
            return res.badRequest({
                message: 'Hanya pembayaran terverifikasi yang dapat direfund.',
            });
        }

        const pendaftaran = pembayaran.pendaftaran_id;

        if (!pendaftaran || pendaftaran.status_pendaftaran !== 'rejected') {
            return res.badRequest({
                message: 'Pendaftaran harus berstatus rejected untuk refund.',
            });
        }

        const kelas = await KelasTurnamen.findOne({
            id: pendaftaran.kelas_turnamen_id,
        });

        if (!kelas || Number(kelas.turnamen_id) !== Number(turnamenId)) {
            return res.badRequest({
                message: 'Pembayaran bukan milik turnamen tersebut.',
            });
        }

        if (pembayaran.status_refund === 'refunded') {
            return res.badRequest({
                message: 'Refund sudah diselesaikan.',
            });
        }

        const jumlahRefund = Number(pembayaran.nominal);

        if (!Number.isFinite(jumlahRefund) || jumlahRefund <= 0) {
            return res.badRequest({
                message: 'Nominal pembayaran tidak valid.',
            });
        }

        // Ambil data peserta
        const peserta = await PesertaPendaftaran.find({
            pendaftaran_id: pendaftaran.id,
        });

        if (!peserta || peserta.length === 0) {
            return res.badRequest({
                message: 'Data peserta pendaftaran tidak ditemukan.',
            });
        }

        const pesertaDenganEmail = peserta.filter(
            (item) => item.email && item.email.trim() !== ''
        );

        if (pesertaDenganEmail.length === 0) {
            return res.badRequest({
                message: 'Email peserta tidak ditemukan. Refund belum dicatat.',
            });
        }

        // Ambil informasi turnamen
        const turnamen = await Turnamen.findOne({
            id: kelas.turnamen_id,
        });

        if (!turnamen) {
            return res.notFound({
                message: 'Data turnamen tidak ditemukan.',
            });
        }

        const tanggalRefund = new Date();

        // Catat refund
        const hasil = await Pembayaran.updateOne({
            id: pembayaran.id,
        }).set({
            status_refund: 'refunded',
            nominal_refund: jumlahRefund,
            tanggal_refund: tanggalRefund,
        });

        if (!hasil) {
            throw new Error('Gagal menyimpan data refund.');
        }

        // Kirim email kepada setiap peserta
        const hasilEmail = await Promise.allSettled(
            pesertaDenganEmail.map((item) =>
                sails.helpers.kirimEmailRefund({
                    email: item.email,
                    nama: item.nama_lengkap,
                    kodePendaftaran: pendaftaran.kode_pendaftaran,
                    namaTurnamen: turnamen.nama,
                    tanggalMulai: String(turnamen.tanggal_mulai),
                    nominalRefund: jumlahRefund,
                    tanggalRefund: tanggalRefund.toISOString(),
                })
            )
        );

        const emailBerhasil = hasilEmail.filter(
            (item) => item.status === 'fulfilled'
        ).length;

        const emailGagal = hasilEmail.filter(
            (item) => item.status === 'rejected'
        ).length;

        hasilEmail.forEach((item, index) => {
            if (item.status === 'rejected') {
                sails.log.error(
                    `Gagal mengirim email refund ke ${pesertaDenganEmail[index].email}:`,
                    item.reason
                );
            }
        });

        return res.json({
            message: 'Refund 100% berhasil dicatat.',
            data: hasil,
            email: {
                total: pesertaDenganEmail.length,
                berhasil: emailBerhasil,
                gagal: emailGagal,
            },
        });

    } catch (err) {
        sails.log.error('Gagal mencatat refund:', err);

        return res.serverError({
            message: 'Gagal mencatat refund.',
            error: err.message,
        });
    }
},

};