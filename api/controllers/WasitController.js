module.exports = {
  list: async function (req, res) {
    const data = await Pertandingan.find({ wasit: req.me.id });
    return res.json(data);
  },

  updateSkor: async function (req, res) {
    const { skor1, skor2, status } = req.body;

    const pertandingan = await Pertandingan.findOne({ id: req.params.id });
    if (!pertandingan) {
      return res.status(404).json({ message: 'Pertandingan tidak ditemukan' });
    }

    if (pertandingan.wasit !== req.me.id) {
      return res.status(403).json({ message: 'Pertandingan ini bukan tugas kamu' });
    }

    const data = {};
    if (skor1 !== undefined) data.skor1 = Number(skor1);
    if (skor2 !== undefined) data.skor2 = Number(skor2);
    if (status) data.status = status;

    try {
      const hasil = await Pertandingan.updateOne({ id: req.params.id }).set(data);
      return res.json(hasil);
    } catch (err) {
      return res.status(400).json({ message: 'Data tidak valid', detail: err.message });
    }
  }
};