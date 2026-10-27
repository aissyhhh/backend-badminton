module.exports = {
    attributes: {
        slug: {
            type: "string",
            required: true,
            unique: true,
        },

        gambar: {
            type: "string",
            allowNull: true,
        },

        nama: {
            type: "string",
            required: true,
        },

        tanggal_mulai: {
            type: "ref",
            columnType: "date",
            required: true,
        },

        tanggal_berakhir: {
            type: "ref",
            columnType: "date",
            required: true,
        },

        venue: {
            type: "string",
            required: true,
        },

        alamat: {
            type: "string",
            allowNull: true,
        },

        tlp: {
            type: "string",
            allowNull: true,
        },

        email: {
            type: "string",
            allowNull: true,
        },

        start_regist: {
            type: "ref",
            columnType: "date",
            required: true,
        },

        end_regist: {
            type: "ref",
            columnType: "date",
            required: true,
        },

        status: {
            type: "string",
            isIn: ["akan_datang", "berlangsung", "selesai", "dibatalkan"],
            defaultsTo: "akan_datang",
        },

        kelas_turnamen: {
            collection: "kelasturnamen",
            via: "turnamen_id",
        }, // relasi ke tabel kelas_turnamen
    },
};
