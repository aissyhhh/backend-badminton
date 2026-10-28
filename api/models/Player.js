module.exports = {
  tableName: 'players',

  attributes: {
    id: {
      type: 'number',
      autoIncrement: true,
      columnName: 'id',
    },

    nama: {
      type: 'string',
      maxLength: 255,
      required: true,
      columnName: 'nama',
    },

    nik: {
      type: 'string',
      maxLength: 255,
      unique: true,
      columnName: 'nik',
    },

    gambar_diri: {
      type: 'string',
      maxLength: 255,
      columnName: 'gambar_diri',
    },

    sektor: {
      type: 'string',
      maxLength: 255,
      columnName: 'sektor',
    },

    rank: {
      type: 'number',
      columnType: 'int',
      columnName: 'rank',
    },

    point: {
      type: 'number',
      columnType: 'int',
      columnName: 'point',
      defaultsTo: 0,
    },

    peserta_pendaftaran: {
      collection: 'PesertaPendaftaran',
      via: 'player_id',
    },

  },
};