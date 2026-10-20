module.exports = {
  tableName: 'articles',

  attributes: {
    slug: { type: "string", required: true, unique: true },
    judul: { type: "string", required: true },
    deskripsi: { type: "string", columnType: "text", required: true },
    kategori: {
      type: "string",
      isIn: ["turnamen", "atlet", "kiat dan teknik"],
      required: true
    },
    gambar: { type: "string", defaultsTo: "" },
    publish_at: { type: "ref", columnType: "datetime" }
  }
};
