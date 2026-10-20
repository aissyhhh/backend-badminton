function buatSlug(teks) {
  return teks
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

module.exports = {
  list: async function (req, res) {
    try {
      const where = {};
      if (req.query.kategori) {
        where.kategori = req.query.kategori;
      }

      const data = await Article.find({
        where,
        sort: "publish_at DESC",
      });

      return res.json(data);
    } catch (err) {
      return res.serverError(err);
    }
  },

  detail: async function (req, res) {
    try {
      const data = await Article.findOne({
        id: req.params.id,
      });

      if (!data) {
        return res.status(404).json({
          message: "Artikel tidak ditemukan",
        });
      }

      return res.json(data);
    } catch (err) {
      return res.serverError(err);
    }
  },

  create: async function (req, res) {
    try {
      const { judul, deskripsi, kategori, gambar, publish_at } = req.body;

      if (!judul || !deskripsi) {
        return res.status(400).json({
          message: "Judul dan deskripsi wajib diisi",
        });
      }

      const data = await Article.create({
        slug: buatSlug(judul),
        judul,
        deskripsi,
        kategori,
        gambar,
        publish_at,
      }).fetch();

      return res.status(201).json(data);
    } catch (err) {
      sails.log.error(err);
      return res.serverError(err);
    }
  },
};
