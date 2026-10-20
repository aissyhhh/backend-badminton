module.exports = {
  // GET /public/articles?kategori=tips&page=1&limit=9
  list: async function (req, res) {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 9, 50);

    const where = { publish_at: { '<=': new Date() } };
    if (req.query.kategori) where.kategori = req.query.kategori;

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
  },

  // GET /public/articles/:slug
  detail: async function (req, res) {
    const data = await Article.findOne({
      slug: req.params.slug,
      publish_at: { '<=': new Date() }
    });

    if (!data) return res.status(404).json({ message: 'Artikel tidak ditemukan' });
    return res.json(data);
  }
};