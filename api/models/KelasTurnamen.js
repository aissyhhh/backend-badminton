module.exports = {
    attributes: {
        turnamen_id: {
            model: "turnamen",
            required: true,
        },

        sektor: {
            type: "string",
            isIn: ["Tunggal Putra", "Tunggal Putri", "Ganda Putra", "Ganda Putri", "Ganda Campuran"],
            required: true,
        },

        kategori_usia: {
            type: "string",
            required: true,
        },

        harga: {
            type: "number",
            columnType: "decimal(12,0)",
            required: true,
        },

        kapasitas: {
            type: "number",
            required: true,
            min: 1,
        }
    },
};
