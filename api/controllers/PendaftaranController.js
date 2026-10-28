const path = require('path');
const fs = require('fs');

module.exports = {
    create: async function (req, res) {
        try {
            const { kelas_turnamen_id, peserta } = req.body;

            if (!kelas_turnamen_id) {
                return res.badRequest({ message: 'kelas_turnamen_id wajib diisi.' });
            }

            if (!peserta || !Array.isArray(peserta) || peserta.length === 0) {
                return res.badRequest({ message: 'Minimal 1 peserta harus diisi.' });
            }

            const kelasTurnamen = await KelasTurnamen.findOne({ id: kelas_turnamen_id })
                .populate('turnamen_id');

            if (!kelasTurnamen) {
                return res.notFound({ message: 'Kelas turnamen tidak ditemukan.' });
            }

            const turnamen = kelasTurnamen.turnamen_id;
            if (turnamen) {
                const today = new Date();
                const startRegist = new Date(turnamen.start_regist);
                const endRegist = new Date(turnamen.end_regist);

                if (today < startRegist || today > endRegist) {
                    return res.badRequest({
                        message: 'Pendaftaran belum dibuka atau sudah ditutup.',
                    });
                }

                if (!['akan_datang', 'pendaftaran', 'berlangsung'].includes(turnamen.status)) {
                    return res.badRequest({
                        message: 'Pendaftaran tidak tersedia untuk turnamen ini.',
                    });
                }
            }

            const kodePendaftaran = await sails.helpers.generateKodePendaftaran();

            const hargaPerPeserta = kelasTurnamen.harga || 0;
            const totalBiaya = hargaPerPeserta * peserta.length;

            const pendaftaran = await Pendaftaran.create({
                kelas_turnamen_id: kelas_turnamen_id,
                kode_pendaftaran: kodePendaftaran,
                tanggal_daftar: new Date(),
                total_biaya: totalBiaya,
                status_pendaftaran: 'pending',
            }).fetch();

            const pesertaRecords = [];

            for (let i = 0; i < peserta.length; i++) {
                const p = peserta[i];

                const record = await PesertaPendaftaran.create({
                    pendaftaran_id: pendaftaran.id,
                    player_id: null,
                    urutan_pemain: p.urutan_pemain || (i + 1),
                    kelas_turnamen_id: kelas_turnamen_id,
                    nama_lengkap: p.nama_lengkap,
                    nama_panggilan: p.nama_panggilan || null,
                    jenis_kelamin: p.jenis_kelamin || null,
                    tempat_lahir: p.tempat_lahir || null,
                    tanggal_lahir: p.tanggal_lahir || null,
                    nik: p.nik || null,
                    alamat: p.alamat || null,
                    nomor_tlp: p.nomor_tlp || null,
                    email: p.email || null,
                    pendidikan_terakhir: p.pendidikan_terakhir || null,
                    nama_klub: p.nama_klub || '',
                    nama_pelatih: p.nama_pelatih || '',
                    nama_ayah: p.nama_ayah || null,
                    pekerjaan_ayah: p.pekerjaan_ayah || null,
                    nomor_tlp_ayah: p.nomor_tlp_ayah || null,
                    nama_ibu: p.nama_ibu || null,
                    pekerjaan_ibu: p.pekerjaan_ibu || null,
                    nomor_tlp_ibu: p.nomor_tlp_ibu || null,
                    riwayat_pertandingan: p.riwayat_pertandingan || '',
                    pencapaian_tertinggi: p.pencapaian_tertinggi || '',
                    foto_akte: p.foto_akte || null,
                    foto_kk: p.foto_kk || null,
                    foto_peserta: p.foto_peserta || null,
                }).fetch();

                pesertaRecords.push(record);
            }

            return res.status(201).json({
                message: 'Pendaftaran berhasil dibuat.',
                data: {
                    pendaftaran: pendaftaran,
                    peserta: pesertaRecords,
                },
            });

        } catch (err) {
            sails.log.error('Error saat membuat pendaftaran:', err);
            sails.log.error('Detail:', err.raw || err.details || err.message);

            return res.serverError({
                message: 'Terjadi kesalahan server.',
                error: err.message,
                details: err.details || null,
            });
        }
    },

    find: async function (req, res) {
        try {
            const {
                kelas_turnamen_id,
                status_pendaftaran,
                kode_pendaftaran,
                page = 1,
                limit = 10,
            } = req.query;

            const where = {};

            if (kelas_turnamen_id) {
                where.kelas_turnamen_id = parseInt(kelas_turnamen_id);
            }
            if (status_pendaftaran) {
                where.status_pendaftaran = status_pendaftaran;
            }
            if (kode_pendaftaran) {
                where.kode_pendaftaran = { contains: kode_pendaftaran };
            }

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const [data, total] = await Promise.all([
                Pendaftaran.find({ where })
                    .populate('kelas_turnamen_id')
                    .populate('peserta_pendaftaran')
                    .sort('tanggal_daftar DESC')
                    .skip(skip)
                    .limit(parseInt(limit)),
                Pendaftaran.count(where),
            ]);

            return res.json({
                message: 'Data pendaftaran berhasil diambil.',
                data,
                meta: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            });

        } catch (err) {
            sails.log.error('Error saat mengambil data pendaftaran:', err);
            return res.serverError({ message: 'Terjadi kesalahan server.', error: err.message });
        }
    },

    findOne: async function (req, res) {
        try {
            const { id } = req.params;

            const pendaftaran = await Pendaftaran.findOne({ id })
                .populate('kelas_turnamen_id')
                .populate('peserta_pendaftaran')
                .populate('pembayaran');

            if (!pendaftaran) {
                return res.notFound({ message: 'Pendaftaran tidak ditemukan.' });
            }

            return res.json({
                message: 'Detail pendaftaran berhasil diambil.',
                data: pendaftaran,
            });

        } catch (err) {
            sails.log.error('Error saat mengambil detail pendaftaran:', err);
            return res.serverError({ message: 'Terjadi kesalahan server.', error: err.message });
        }
    },

    findByKode: async function (req, res) {
        try {
            const { kode } = req.params;

            const pendaftaran = await Pendaftaran.findOne({ kode_pendaftaran: kode })
                .populate('kelas_turnamen_id')
                .populate('peserta_pendaftaran')
                .populate('pembayaran');

            if (!pendaftaran) {
                return res.notFound({ message: 'Pendaftaran dengan kode tersebut tidak ditemukan.' });
            }

            return res.json({
                message: 'Pendaftaran ditemukan.',
                data: pendaftaran,
            });

        } catch (err) {
            sails.log.error('Error saat mencari pendaftaran by kode:', err);
            return res.serverError({ message: 'Terjadi kesalahan server.', error: err.message });
        }
    },

    updateStatus: async function (req, res) {
        try {
            const { id } = req.params;
            const { status_pendaftaran } = req.body;

            const validStatuses = [
                'pending',
                'confirmed',
                'cancelled',
                'rejected',
            ];

            if (!status_pendaftaran || !validStatuses.includes(status_pendaftaran)) {
                return res.badRequest({
                    message: `Status tidak valid. Gunakan salah satu: ${validStatuses.join(', ')}`,
                });
            }

            const pendaftaran = await Pendaftaran.findOne({ id });

            if (!pendaftaran) {
                return res.notFound({
                    message: 'Pendaftaran tidak ditemukan.',
                });
            }

            // Ambil seluruh peserta dalam pendaftaran ini.
            const pesertaList = await PesertaPendaftaran.find({
                pendaftaran_id: pendaftaran.id,
            });

            // Jika dikonfirmasi, pastikan semua peserta memiliki NIK.
            if (status_pendaftaran === 'confirmed') {
                if (pesertaList.length === 0) {
                    return res.badRequest({
                        message: 'Pendaftaran belum memiliki peserta.',
                    });
                }

                const pesertaTanpaNik = pesertaList.find(
                    (peserta) => !peserta.nik || !peserta.nik.trim()
                );

                if (pesertaTanpaNik) {
                    return res.badRequest({
                        message: `NIK peserta ${pesertaTanpaNik.nama_lengkap} wajib diisi.`,
                    });
                }

                // Periksa NIK ganda di dalam pendaftaran yang sama.
                const daftarNik = pesertaList.map(
                    (peserta) => peserta.nik.trim()
                );

                if (new Set(daftarNik).size !== daftarNik.length) {
                    return res.badRequest({
                        message: 'Terdapat NIK yang sama pada peserta dalam pendaftaran ini.',
                    });
                }

                for (const peserta of pesertaList) {
                    let player = null;

                    // Jika sudah terhubung ke Player, gunakan pemain tersebut.
                    if (peserta.player_id) {
                        player = await Player.findOne({
                            id: peserta.player_id,
                        });
                    }

                    // Jika belum terhubung, cari berdasarkan NIK.
                    if (!player) {
                        player = await Player.findOne({
                            nik: peserta.nik.trim(),
                        });
                    }

                    // Kalau belum ada, buat Player baru.
                    if (!player) {
                        const kelasTurnamen = peserta.kelas_turnamen_id
                            ? await KelasTurnamen.findOne({
                                id: peserta.kelas_turnamen_id,
                            })
                            : null;

                        player = await Player.create({
                            nama: peserta.nama_lengkap,
                            nik: peserta.nik.trim(),
                            gambar_diri: peserta.foto_peserta || undefined,
                            sektor: kelasTurnamen
                                ? kelasTurnamen.sektor
                                : undefined,
                        }).fetch();
                    }

                    // Hubungkan peserta dengan Player.
                    if (peserta.foto_peserta && !player.gambar_diri) {
                        player = await Player.updateOne({
                            id: player.id,
                        }).set({
                            gambar_diri: peserta.foto_peserta,
                        });
                    }
                }
            }

            // Perbarui status pendaftaran.
            const updated = await Pendaftaran.updateOne({
                id: pendaftaran.id,
            }).set({
                status_pendaftaran,
            });

            return res.json({
                message: `Status pendaftaran berhasil diubah ke "${status_pendaftaran}".`,
                data: updated,
            });

        } catch (err) {
            sails.log.error(
                'Error saat update status pendaftaran:',
                err
            );

            return res.serverError({
                message: 'Terjadi kesalahan server.',
                error: err.message,
            });
        }
    },

    destroy: async function (req, res) {
        try {
            const { id } = req.params;

            const pendaftaran = await Pendaftaran.findOne({ id });

            if (!pendaftaran) {
                return res.notFound({ message: 'Pendaftaran tidak ditemukan.' });
            }

            await PesertaPendaftaran.destroy({ pendaftaran_id: id });
            await Pendaftaran.destroyOne({ id });

            return res.json({
                message: 'Pendaftaran berhasil dihapus.',
            });

        } catch (err) {
            sails.log.error('Error saat menghapus pendaftaran:', err);
            return res.serverError({ message: 'Terjadi kesalahan server.', error: err.message });
        }
    },

    uploadDokumen: async function (req, res) {
        try {
            const { peserta_id, tipe } = req.body;

            const validTipes = ['foto_akte', 'foto_kk', 'foto_peserta'];

            if (!peserta_id || !tipe || !validTipes.includes(tipe)) {
                return res.badRequest({
                    message: `peserta_id dan tipe wajib diisi. Tipe valid: ${validTipes.join(', ')}`,
                });
            }

            const peserta = await PesertaPendaftaran.findOne({ id: peserta_id });

            if (!peserta) {
                return res.notFound({ message: 'Peserta tidak ditemukan.' });
            }

            req.file('file').upload(
                {
                    dirname: path.resolve(sails.config.appPath, 'assets/uploads/dokumen'),
                    maxBytes: 5 * 1024 * 1024, // max 5MB
                },
                async (err, uploadedFiles) => {
                    if (err) {
                        return res.serverError({ message: 'Gagal upload file.', error: err.message });
                    }

                    if (uploadedFiles.length === 0) {
                        return res.badRequest({ message: 'Tidak ada file yang diupload.' });
                    }

                    const filePath = path.basename(uploadedFiles[0].fd);

                    const updateData = {};
                    updateData[tipe] = `/uploads/dokumen/${filePath}`;

                    const updated = await PesertaPendaftaran.updateOne({ id: peserta_id }).set(updateData);

                    return res.json({
                        message: `${tipe} berhasil diupload.`,
                        data: updated,
                    });
                }
            );

        } catch (err) {
            sails.log.error('Error saat upload dokumen:', err);
            return res.serverError({ message: 'Terjadi kesalahan server.', error: err.message });
        }
    },
};