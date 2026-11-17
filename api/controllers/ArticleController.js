const fs = require("fs");
const path = require("path");

function buatSlug(teks) {
  return teks
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
        publish_at: { "<=": new Date() },
      };

      if (req.query.kategori) where.kategori = req.query.kategori;
      if (req.query.search) where.judul = { contains: req.query.search };

      const total = await Article.count(where);
      const data = await Article.find({
        where,
        sort: "publish_at DESC",
        skip: (page - 1) * limit,
        limit,
      });

      return res.json({
        data,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      });
    } catch (err) {
      sails.log.error(err);
      return res.serverError(err);
    }
  },

  listAdmin: async function (req, res) {
    try {
      const data = await Article.find({ sort: "id DESC" });
      return res.json({ data, total: data.length });
    } catch (err) {
      sails.log.error(err);
      return res.serverError(err);
    }
  },

  detail: async function (req, res) {
    try {
      const data = await Article.findOne({ id: req.params.id });

      if (!data) {
        return res.notFound({ message: "Artikel tidak ditemukan" });
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
        publish_at: { "<=": new Date() },
      });

      if (!data) {
        return res.notFound({ message: "Artikel tidak ditemukan" });
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
        return res.badRequest({
          message: "Judul, deskripsi, dan kategori wajib diisi",
        });
      }

      const data = await Article.create({
        slug: buatSlug(judul),
        judul,
        deskripsi,
        kategori,
        gambar: gambar || "",
        publish_at: publish_at ? new Date(publish_at) : null,
      }).fetch();

      return res.status(201).json({
        message: "Artikel berhasil ditambahkan",
        data,
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
        return res.notFound({ message: "Artikel tidak ditemukan" });
      }

      const perubahan = {};

      if (judul !== undefined) {
        if (!judul.trim()) {
          return res.badRequest({ message: "Judul tidak boleh kosong" });
        }

        perubahan.judul = judul;
        perubahan.slug = buatSlug(judul);
      }

      if (deskripsi !== undefined) {
        if (!deskripsi.trim()) {
          return res.badRequest({ message: "Deskripsi tidak boleh kosong" });
        }

        perubahan.deskripsi = deskripsi;
      }

      if (kategori !== undefined) perubahan.kategori = kategori;
      if (gambar !== undefined) perubahan.gambar = gambar;
      if (publish_at !== undefined) {
        perubahan.publish_at = publish_at ? new Date(publish_at) : null;
      }

      const data = await Article.updateOne({ id }).set(perubahan);

      return res.json({
        message: "Artikel berhasil diperbarui",
        data,
      });
    } catch (err) {
      sails.log.error(err);
      return res.serverError(err);
    }
  },

  uploadGambar: async function (req, res) {
    try {
      const { id, folderApp } = req.params;
      const allowedApps = ["shuttlehub", "shuttler"];

      if (!allowedApps.includes(folderApp)) {
        return res.badRequest({ message: "Aplikasi tidak valid" });
      }

      const artikel = await Article.findOne({ id });

      if (!artikel) {
        return res.notFound({ message: "Artikel tidak ditemukan" });
      }

      const tempDir = path.join(sails.config.appPath, ".tmp", "uploads");
      await fs.promises.mkdir(tempDir, { recursive: true });

      req.file("gambar").upload(
        { dirname: tempDir, maxBytes: 5 * 1024 * 1024 },
        async (error, files) => {
          if (error) return res.serverError(error);

          if (!files || !files.length) {
            return res.badRequest({ message: "Gambar belum dipilih" });
          }

          const file = files[0];
          const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

          if (!allowedTypes.includes(file.type)) {
            await fs.promises.unlink(file.fd).catch(() => {});
            return res.badRequest({
              message: "Format gambar harus JPG, PNG, atau WEBP",
            });
          }

          const extension = path.extname(file.filename).toLowerCase();
          const fileName = `page${extension}`;

          const uploadDir = path.join(
            sails.config.appPath,
            "uploads",
            folderApp,
            "articles",
            String(id)
          );

          await fs.promises.mkdir(uploadDir, { recursive: true });

          const destination = path.join(uploadDir, fileName);
          const gambar = `/uploads/${folderApp}/articles/${id}/${fileName}`;

          try {
            await fs.promises.rename(file.fd, destination);
            await Article.updateOne({ id }).set({ gambar });

            return res.ok({
              message: "Gambar artikel berhasil diupload",
              gambar,
            });
          } catch (err) {
            await fs.promises.unlink(file.fd).catch(() => {});
            return res.serverError(err);
          }
        }
      );
    } catch (err) {
      return res.serverError(err);
    }
  },

  serveGambar: async function (req, res) {
    try {
      const { folderApp, id, filename } = req.params;

      if (!["shuttlehub", "shuttler"].includes(folderApp)) {
        return res.badRequest({ message: "Aplikasi tidak valid" });
      }

      const filePath = path.join(
        sails.config.appPath,
        "uploads",
        folderApp,
        "articles",
        String(id),
        path.basename(filename)
      );

      if (!fs.existsSync(filePath)) {
        return res.notFound({ message: "Gambar artikel tidak ditemukan" });
      }

      return res.sendFile(filePath);
    } catch (err) {
      return res.serverError(err);
    }
  },

  delete: async function (req, res) {
    try {
      const id = req.params.id;
      const artikel = await Article.findOne({ id });

      if (!artikel) {
        return res.notFound({ message: "Artikel tidak ditemukan" });
      }

      await Article.destroyOne({ id });

      return res.json({ message: "Artikel berhasil dihapus" });
    } catch (err) {
      sails.log.error(err);
      return res.serverError(err);
    }
  },
};