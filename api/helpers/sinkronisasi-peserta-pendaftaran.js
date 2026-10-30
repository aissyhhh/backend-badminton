module.exports = {
    friendlyName: 'Sinkronisasi peserta pendaftaran',

    inputs: {
        pendaftaranId: {
            type: 'number',
            required: true,
        },
    },

    fn: async function ({ pendaftaranId }) {
        const pendaftaran = await Pendaftaran.findOne({
            id: pendaftaranId,
        });

        if (!pendaftaran || pendaftaran.status_pendaftaran !== 'confirmed') {
            return {
                berhasil: false,
                message: 'Pendaftaran belum dikonfirmasi.',
            };
        }

        const pembayaran = await Pembayaran.findOne({
            pendaftaran_id: pendaftaranId,
            status_pembayaran: 'verified',
        });

        if (!pembayaran) {
            return {
                berhasil: false,
                message: 'Pembayaran belum diverifikasi.',
            };
        }

        const pesertaList = await PesertaPendaftaran.find({
            pendaftaran_id: pendaftaranId,
        });

        if (pesertaList.length === 0) {
            return {
                berhasil: false,
                message: 'Pendaftaran belum memiliki peserta.',
            };
        }

        // Validasi semua NIK sebelum proses sinkronisasi.
        for (const peserta of pesertaList) {
            if (!peserta.nik || !peserta.nik.trim()) {
                throw new Error(
                    `NIK peserta ${peserta.nama_lengkap} wajib diisi.`
                );
            }
        }

        let jumlahDisinkronkan = 0;
        let emailTerkirim = 0;
        let emailGagal = 0;

        for (const peserta of pesertaList) {
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

            if (Number(peserta.player_id) !== Number(player.id)) {
                await PesertaPendaftaran.updateOne({
                    id: peserta.id,
                }).set({
                    player_id: player.id,
                });
            }

            jumlahDisinkronkan++;

            // Kirim email hanya jika belum berhasil dikirim.
            if (peserta.email && peserta.email_terkirim !== true) {
                try {
                    await sails.helpers.kirimEmailPeserta({
                        email: peserta.email,
                        nama: peserta.nama_lengkap,
                        kodePendaftaran: pendaftaran.kode_pendaftaran,
                    });

                    await PesertaPendaftaran.updateOne({
                        id: peserta.id,
                    }).set({
                        email_terkirim: true,
                    });

                    emailTerkirim++;
                } catch (err) {
                    emailGagal++;

                    sails.log.error(
                        `Gagal mengirim email ke ${peserta.email}:`,
                        err
                    );
                }
            }
        }

        return {
            berhasil: true,
            jumlah: jumlahDisinkronkan,
            emailTerkirim,
            emailGagal,
            message: 'Sinkronisasi peserta selesai diproses.',
        };
    },
};