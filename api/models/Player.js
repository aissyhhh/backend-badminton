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

    gambar_diri: {
      type: 'string',
      maxLength: 255,
      columnName: 'gambar_diri',
    },

    negara: {
      type: 'string',
      maxLength: 255,
      columnName: 'negara',
    },

    bendera: {
      type: 'string',
      maxLength: 255,
      columnName: 'bendera',
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