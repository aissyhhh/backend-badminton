module.exports = {
    attributes: {
        turnamen_id: {
            model: "turnamen",
            required: true,
        },

        sektor: {
            type: "string",
            isIn: ["MS", "WS", "MD", "WD", "XD"],
            required: true,
        },

        kategori_usia: {
            type: "string",
            required: true,
        },

        harga: {
            type: "number",
            columnType: "decimal(12,2)",
            required: true,
        },
    },
};
