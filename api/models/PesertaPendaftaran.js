module.exports = {
  tableName: 'peserta_pendaftaran',

  attributes: {
    id: {
      type: 'number',
      autoIncrement: true,
      columnName: 'id',
    },

    pendaftaran_id: {
      model: 'Pendaftaran',
      columnName: 'pendaftaran_id',
      required: true,
    },

    player_id: {
      model: 'Players',
      columnName: 'player_id',
    },

    urutan_pemain: {
      type: 'number',
      columnType: 'tinyint',
      columnName: 'urutan_pemain',
    },

    nama_lengkap: {
      type: 'string',
      maxLength: 255,
      required: true,
      columnName: 'nama_lengkap',
    },

    nama_panggilan: {
      type: 'string',
      maxLength: 255,
      columnName: 'nama_panggilan',
    },

    jenis_kelamin: {
      type: 'string',
      isIn: ['L', 'P'],
      columnName: 'jenis_kelamin',
    },

    tempat_lahir: {
      type: 'string',
      maxLength: 255,
      columnName: 'tempat_lahir',
    },

    tanggal_lahir: {
      type: 'ref',
      columnType: 'date',
      columnName: 'tanggal_lahir',
    },

    nik: {
      type: 'string',
      maxLength: 255,
      columnName: 'nik',
    },

    alamat: {
      type: 'string',
      columnType: 'text',
      columnName: 'alamat',
    },

    nomor_tlp: {
      type: 'string',
      maxLength: 255,
      columnName: 'nomor_tlp',
    },

    email: {
      type: 'string',
      maxLength: 255,
      isEmail: true,
      columnName: 'email',
    },

    pendidikan_terakhir: {
      type: 'string',
      maxLength: 255,
      columnName: 'pendidikan_terakhir',
    },

    nama_klub: {
      type: 'string',
      maxLength: 255,
      columnName: 'nama_klub',
    },

    nama_sekolah: {
      type: 'string',
      maxLength: 255,
      columnName: 'nama_sekolah',
    },

    nama_ayah: {
      type: 'string',
      maxLength: 255,
      columnName: 'nama_ayah',
    },

    pekerjaan_ayah: {
      type: 'string',
      maxLength: 255,
      columnName: 'pekerjaan_ayah',
    },

    nomor_tlp_ayah: {
      type: 'string',
      maxLength: 255,
      columnName: 'nomor_tlp_ayah',
    },

    nama_ibu: {
      type: 'string',
      maxLength: 255,
      columnName: 'nama_ibu',
    },

    pekerjaan_ibu: {
      type: 'string',
      maxLength: 255,
      columnName: 'pekerjaan_ibu',
    },

    nomor_tlp_ibu: {
      type: 'string',
      maxLength: 255,
      columnName: 'nomor_tlp_ibu',
    },

    riwayat_pertandingan: {
      type: 'string',
      columnType: 'text',
      columnName: 'riwayat_pertandingan',
    },

    pencapaian_tertinggi: {
      type: 'string',
      maxLength: 255,
      columnName: 'pencapaian_tertinggi',
    },

    foto_akte: {
      type: 'string',
      maxLength: 255,
      columnName: 'foto_akte',
    },

    foto_kk: {
      type: 'string',
      maxLength: 255,
      columnName: 'foto_kk',
    },

    foto_peserta: {
      type: 'string',
      maxLength: 255,
      columnName: 'foto_peserta',
    },
  },
};