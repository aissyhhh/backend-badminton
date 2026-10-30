const nodemailer = require('nodemailer');

module.exports = {
    friendlyName: 'Kirim email pendaftaran',

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
    },

    fn: async function (inputs) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: `"ShuttleHub" <${process.env.EMAIL_USER}>`,
            to: inputs.email,
            subject: 'Selamat! Pendaftaran Berhasil — ShuttleHub',
            text: `Halo, ${inputs.nama}!

                Selamat! Kamu berhasil bergabung sebagai peserta turnamen di ShuttleHub.

                Kode pendaftaran: ${inputs.kodePendaftaran}

                Pendaftaran kamu sudah dikonfirmasi dan pembayaran telah diverifikasi.

                Terima kasih telah bergabung bersama ShuttleHub.
                Semoga sukses dan selamat bertanding!

                Salam,
                Tim ShuttleHub`,
        });
    },
};