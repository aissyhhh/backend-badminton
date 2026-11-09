require('dotenv').config();

const nodemailer = require('nodemailer');

function formatTanggal(tanggal) {
    return new Date(tanggal).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
    });
}

module.exports = {
    friendlyName: 'Kirim email peserta',

    description: 'Mengirim email konfirmasi pendaftaran kepada peserta.',

    inputs: {
        email: {
            type: 'string',
            required: true,
        },

        nama: {
            type: 'string',
            required: true,
        },

        kodePendaftaran: {
            type: 'string',
            required: true,
        },

        namaTurnamen: {
            type: 'string',
            required: true,
        },

        tanggalMulai: {
            type: 'string',
            required: true,
        },
    },

    fn: async function (inputs) {
        const emailUser = process.env.EMAIL_USER;
        const emailPassword = process.env.EMAIL_APP_PASSWORD;

        if (!emailUser || !emailPassword) {
            throw new Error('Konfigurasi email belum lengkap.');
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',

            auth: {
                user: emailUser,
                pass: emailPassword,
            },
        });

        await transporter.sendMail({
            from: `"ShuttleHub" <${emailUser}>`,
            to: inputs.email,
            subject: 'Pendaftaran Turnamen Berhasil Dikonfirmasi - ShuttleHub',

            text: `Halo ${inputs.nama},

            Selamat! Pendaftaran kamu di ShuttleHub telah berhasil dikonfirmasi.

            Berikut detail pendaftaran kamu:

            Nama Turnamen: ${inputs.namaTurnamen}
            Tanggal Mulai: ${formatTanggal(inputs.tanggalMulai)}
            Kode Pendaftaran: ${inputs.kodePendaftaran}

            Pastikan kamu menyimpan kode pendaftaran tersebut untuk keperluan pengecekan data.

            Terima kasih telah mendaftar dan menjadi bagian dari turnamen ShuttleHub. Semoga sukses dalam pertandingan!

            Salam,
            Tim ShuttleHub
            `,
        });

        return {
            berhasil: true,
            message: `Email berhasil dikirim ke ${inputs.email}.`,
        };
    },
};