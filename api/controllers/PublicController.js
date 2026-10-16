function rapikan(p) {
  return {
    id: p.id,
    pemain1: p.pemain1,
    pemain2: p.pemain2,
    tanggal: p.tanggal,
    lapangan: p.lapangan,
    skor1: p.skor1,
    skor2: p.skor2,
    status: p.status,
    wasit: p.wasit ? p.wasit.name : null
  };
}

module.exports = {

  list: async function (req, res) {
    const where = {};
    if (req.query.status) where.status = req.query.status;

    const data = await Pertandingan.find(where).populate('wasit');
    return res.json(data.map(rapikan));
  },

  detail: async function (req, res) {
    const data = await Pertandingan.findOne({ id: req.params.id }).populate('wasit');
    if (!data) return res.status(404).json({ message: 'Pertandingan tidak ditemukan' });
    return res.json(rapikan(data));
  }
};