module.exports = {
  tableName: 'pendaftaran',

  attributes: {
    id: {
      type: 'number',
      autoIncrement: true,
      columnName: 'id',
    },

    kelas_turnamen_id: {
      model: 'KelasTurnamen',
      columnName: 'kelas_turnamen_id',
      required: true,
    },

    kode_pendaftaran: {
      type: 'string',
      maxLength: 255,
      columnName: 'kode_pendaftaran',
      unique: true,
    },

    tanggal_daftar: {
      type: 'ref',
      columnType: 'datetime',
      columnName: 'tanggal_daftar',
    },

    total_biaya: {
      type: 'number',
      columnType: 'decimal',
      columnName: 'total_biaya',
      defaultsTo: 0,
    },

    status_pendaftaran: {
      type: 'string',
      isIn: ['pending', 'confirmed', 'cancelled', 'rejected'],
      defaultsTo: 'pending',
      columnName: 'status_pendaftaran',
    },

    email_terkirim: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'email_terkirim',
    },

    // Associations
    peserta_pendaftaran: {
      collection: 'PesertaPendaftaran',
      via: 'pendaftaran_id',
    },

    pembayaran: {
      collection: 'Pembayaran',
      via: 'pendaftaran_id',
    },
  },
};


