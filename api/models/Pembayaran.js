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

    status_refund: {
      type: 'string',
      isIn: ['not_required', 'pending', 'processing', 'refunded'],
      defaultsTo: 'not_required',
      columnName: 'status_refund',
    },

    nominal_refund: {
      type: 'number',
      columnType: 'decimal',
      defaultsTo: 0,
      columnName: 'nominal_refund',
    },

    tanggal_refund: {
      type: 'ref',
      columnType: 'datetime',
      columnName: 'tanggal_refund',
    },
  },
};