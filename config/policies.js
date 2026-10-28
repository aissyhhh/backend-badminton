const KelasTurnamenController = require("../api/controllers/KelasTurnamenController");
const KelasTurnamen = require("../api/models/KelasTurnamen");

module.exports.policies = {
  '*': 'isAuthenticated',

  AuthController: {
    login: true,
    me: 'isAuthenticated',
  },

  UserController: {
    '*': ['isAuthenticated', 'isAdmin'],
  },

  WasitController: {
    '*': ['isAuthenticated', 'isWasit'],
  },

  ArticleController: {
    list: true,
    detail: true,
    findBySlug: true,
    '*': ['isAuthenticated', 'isAdmin'],
  },

  TurnamenController: {
    find: true,
    findOne: true,
    '*': ['isAuthenticated', 'isAdmin'],
  },

  KelasTurnamenController: {
    '*': ['isAuthenticated', 'isAdmin'],
    find: true,
    findOne: true,
    findByTurnamen: true,
  },

  PendaftaranController: {
    create: true,
    findByKode: true,
    find: ['isAuthenticated', 'isAdmin'],
    findOne: ['isAuthenticated', 'isAdmin'],
    updateStatus: ['isAuthenticated', 'isAdmin'],
    destroy: ['isAuthenticated', 'isAdmin'],
    uploadDokumen: true,
  },

  PembayaranController: {
    '*': ['isAuthenticated', 'isAdmin'],
  },
};
