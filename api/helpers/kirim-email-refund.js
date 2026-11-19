
require('dotenv').config();

const nodemailer = require('nodemailer');

function formatTanggal(tanggal) {
    return new Date(tanggal).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta',
    });
}

module.exports = {
    friendlyName: 'Kirim email refund',

    description: 'Mengirim pemberitahuan penolakan pendaftaran dan refund kepada peserta.',

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

        nominalRefund: {
            type: 'number',
            required: true,
        },

        tanggalRefund: {
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

        const nominal = Number(inputs.nominalRefund).toLocaleString('id-ID');

        await transporter.sendMail({
            from: `"ShuttleHub" <${emailUser}>`,
            to: inputs.email,
            subject: 'Pemberitahuan Penolakan Pendaftaran dan Refund - ShuttleHub',

            text: `Halo ${inputs.nama},

Kami ingin memberitahukan bahwa pendaftaran turnamen kamu telah ditolak.

Berikut detail pendaftaran:

Nama Turnamen: ${inputs.namaTurnamen}
Tanggal Mulai: ${formatTanggal(inputs.tanggalMulai)}
Kode Pendaftaran: ${inputs.kodePendaftaran}

Pengembalian Dana:
Nominal Refund: Rp${nominal}
Tanggal Refund: ${formatTanggal(inputs.tanggalRefund)}
Status: Telah Dikembalikan

Dana pendaftaran sebesar Rp${nominal} telah dikembalikan kepada kamu.

Mohon simpan email ini sebagai bukti pemberitahuan pengembalian dana.

Terima kasih atas pengertian kamu.

Salam,
Tim ShuttleHub`,
        });

        return {
            berhasil: true,
            message: `Email refund berhasil dikirim ke ${inputs.email}.`,
        };
    },
};
