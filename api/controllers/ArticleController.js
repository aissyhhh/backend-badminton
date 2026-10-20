function buatSlug(teks) {
    return teks
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

module.exports = {
  list: async function (req, res) {
    const where = {};
    if (req.query.kategori) where.kategori = req.query.kategori;

    const data = await Article.find({ where, sort: 'createdAt DESC' });
    return res.json(data);
  },

  detail: async function (req, res) {
    const data = await Article.findOne({ id: req.params.id });
    if (!data) return res.status(404).json({ message: 'Artikel tidak ditemukan' });
    return res.json(data);
  },

  create: async function (req, res) {
    const { judul, deskripsi, kategori, gambar, publish_at } = req.body;

        if (!judul || !deskripsi) {
        return res.status(400).json({ message: 'Judul dan deskripsi wajib diisi'})
        };
    },
}
