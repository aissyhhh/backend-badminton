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
      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Number(req.query.limit) || 9, 50);

      const where = {
        publish_at: { '<=': new Date() }
      };

      if (req.query.kategori) {
        where.kategori = req.query.kategori;
      }

      const total = await Article.count(where);
      const data = await Article.find({
        where,
        sort: 'publish_at DESC',
        skip: (page - 1) * limit,
        limit
      });

      return res.json({
        data,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      });
    } catch (err) {
      sails.log.error(err);
      return res.serverError(err);
    }
  },

  detail: async function (req, res) {
    try {
      const data = await Article.findOne({
        id: req.params.id,
        publish_at: { "<=": new Date() }
      });

      if (!data) {
        return res.status(404).json({
          message: "Artikel tidak ditemukan"
        });
      }

      return res.json(data);
    } catch (err) {
      sails.log.error(err);
      return res.serverError(err);
    }
  },

  findBySlug: async function (req, res) {
    try {
      const data = await Article.findOne({
        slug: req.params.slug,
        publish_at: { "<=": new Date() }
      });

      if (!data) {
        return res.status(404).json({
          message: "Artikel tidak ditemukan"
        });
      }

      return res.json(data);
    } catch (err) {
      sails.log.error(err);
      return res.serverError(err);
    }
  },

  create: async function (req, res) {
    try {
      const { judul, deskripsi, kategori, gambar, publish_at } = req.body;

      if (!judul || !deskripsi || !kategori) {
        return res.status(400).json({
          message: "Judul, deskripsi, dan kategori wajib diisi"
        });
      }

      const data = await Article.create({ slug: buatSlug(judul), judul, deskripsi, kategori, gambar: gambar || "", publish_at: publish_at || null }).fetch();

      return res.status(201).json({
        message: "Artikel berhasil ditambahkan",
        data
      });
    } catch (err) {
      sails.log.error(err);
      return res.serverError(err);
    }
  },

  update: async function (req, res) {
    try {
      const id = req.params.id;
      const { judul, deskripsi, kategori, gambar, publish_at } = req.body;

      const artikel = await Article.findOne({ id });

      if (!artikel) {
        return res.status(404).json({
          message: "Artikel tidak ditemukan"
        });
      }

      const perubahan = {};

      if (judul !== undefined) {
        if (!judul.trim()) {
          return res.status(400).json({
            message: "Judul tidak boleh kosong"
          });
        }

        perubahan.judul = judul;
        perubahan.slug = buatSlug(judul);
      }

      if (deskripsi !== undefined) {
        if (!deskripsi.trim()) {
          return res.status(400).json({
            message: "Deskripsi tidak boleh kosong"
          });
        }

        perubahan.deskripsi = deskripsi;
      }

      if (kategori !== undefined) {
        perubahan.kategori = kategori;
      }

      if (gambar !== undefined) {
        perubahan.gambar = gambar;
      }

      if (publish_at !== undefined) {
        perubahan.publish_at = publish_at;
      }

      const data = await Article.updateOne({ id }).set(perubahan);

      return res.json({
        message: "Artikel berhasil diperbarui",
        data
      });
    } catch (err) {
      sails.log.error(err);
      return res.serverError(err);
    }
  },

  delete: async function (req, res) {
    try {
      const id = req.params.id;

      const artikel = await Article.findOne({ id });

      if (!artikel) {
        return res.status(404).json({
          message: "Artikel tidak ditemukan"
        });
      }

      await Article.destroyOne({ id });

      return res.json({
        message: "Artikel berhasil dihapus"
      });
    } catch (err) {
      sails.log.error(err);
      return res.serverError(err);
    }
  }
};