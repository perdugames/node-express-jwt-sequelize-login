'use strict';
module.exports = (sequelize, DataTypes) => {
  const JwtResetPasswords = sequelize.define('JwtResetPasswords', {
    userId: DataTypes.UUID,
    jwt: DataTypes.STRING(900)
  }, {});
  JwtResetPasswords.associate = function(models) {
    JwtResetPasswords.belongsTo(models.User, {foreignKey: 'userId'});
  };
  return JwtResetPasswords;
};