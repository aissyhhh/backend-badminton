module.exports = {
  attributes: {
    name: { type: 'string', required: true },
    email: { type: 'string', required: true, unique: true },
    password: { type: 'string', required: true },
    role: {type: 'string', isIn: ['admin', 'wasit'], defaultsTo: 'wasit' }
  },

  customToJSON: function(){
    const {password, ...rest} = this;
    return rest;
  }
};
