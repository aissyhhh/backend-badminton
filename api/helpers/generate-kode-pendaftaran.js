module.exports = {
    friendlyName: 'Generate kode pendaftaran',

    description: 'Membuat kode pendaftaran dengan format REG-YYYYMMDD-XXXXX.',

    inputs: {},

    exits: {
        success: {
            description: 'Kode pendaftaran berhasil digenerate.',
        },
    },

    fn: async function () {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        const dateStr = `${year}${month}${day}`;
        const prefix = `REG-${dateStr}-`;

        const lastEntry = await Pendaftaran.find({
            where: {
                kode_pendaftaran: {
                    startsWith: prefix,
                },
            },
        }).sort('id DESC').limit(1);

        let sequence = 1;

        if (lastEntry.length > 0) {
            const lastKode = lastEntry[0].kode_pendaftaran;
            const lastSeq = parseInt(lastKode.split('-')[2], 10);

            if (Number.isInteger(lastSeq)) {
                sequence = lastSeq + 1;
            }
        }

        return `${prefix}${String(sequence).padStart(5, '0')}`;
    },
};