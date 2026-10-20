module.exports = {
  tableName: 'articles',

  attributes: {
    slug: { type: 'string', required: true, unique: true },
    judul: { type: 'string', required: true },
    deskripsi: { type: 'string', columnType: 'text', required: true },
    kategori: { type: 'string', defaultsTo: '' },
    gambar: { type: 'string', defaultsTo: '' },
    publish_at: { type: 'ref', columnType: 'datetime' }
  }
};
