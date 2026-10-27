module.exports = {
  tableName: 'pembayaran',

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

    metode_pembayaran: {
      type: 'string',
      isIn: ['transfer', 'cash', 'ewallet', 'qris'],
      columnName: 'metode_pembayaran',
    },

    nominal: {
      type: 'number',
      columnType: 'decimal',
      columnName: 'nominal',
      defaultsTo: 0,
    },

    bukti_pembayaran: {
      type: 'string',
      maxLength: 255,
      columnName: 'bukti_pembayaran',
    },

    tanggal_pembayaran: {
      type: 'ref',
      columnType: 'datetime',
      columnName: 'tanggal_pembayaran',
    },

    status_pembayaran: {
      type: 'string',
      isIn: ['pending', 'verified', 'rejected'],
      defaultsTo: 'pending',
      columnName: 'status_pembayaran',
    },
  },
};

