module.exports = {

  list: async function (req, res) {
    const data = await Pertandingan.find().populate('wasit');
    return res.json(data);
  },

  detail: async function (req, res) {
    const data = await Pertandingan.findOne({ id: req.params.id }).populate('wasit');
    if (!data) return res.status(404).json({ message: 'Pertandingan tidak ditemukan' });
    return res.json(data);
  },

  create: async function (req, res) {
    const { pemain1, pemain2, tanggal, lapangan, wasit } = req.body;

    if (!pemain1 || !pemain2 || !tanggal) {
      return res.status(400).json({ message: 'pemain1, pemain2, dan tanggal wajib diisi' });
    }

    if (wasit) {
      const w = await User.findOne({ id: wasit, role: 'wasit' });
      if (!w) return res.status(400).json({ message: 'Wasit tidak ditemukan' });
    }

    try {
      const data = await Pertandingan.create({
        pemain1, pemain2, tanggal, lapangan, wasit
      }).fetch();
      return res.status(201).json(data);
    } catch (err) {
      return res.status(400).json({ message: 'Data tidak valid', detail: err.message });
    }
  },

  update: async function (req, res) {
    const { pemain1, pemain2, tanggal, lapangan, wasit, status } = req.body;
    const data = {};

    if (pemain1) data.pemain1 = pemain1;
    if (pemain2) data.pemain2 = pemain2;
    if (tanggal) data.tanggal = tanggal;
    if (lapangan !== undefined) data.lapangan = lapangan;
    if (status) data.status = status;

    if (wasit) {
      const w = await User.findOne({ id: wasit, role: 'wasit' });
      if (!w) return res.status(400).json({ message: 'Wasit tidak ditemukan' });
      data.wasit = wasit;
    }

    try {
      const hasil = await Pertandingan.updateOne({ id: req.params.id }).set(data);
      if (!hasil) return res.status(404).json({ message: 'Pertandingan tidak ditemukan' });
      return res.json(hasil);
    } catch (err) {
      return res.status(400).json({ message: 'Data tidak valid', detail: err.message });
    }
  },

  destroy: async function (req, res) {
    const hasil = await Pertandingan.destroyOne({ id: req.params.id });
    if (!hasil) return res.status(404).json({ message: 'Pertandingan tidak ditemukan' });
    return res.json({ message: 'Pertandingan dihapus' });
  }
};