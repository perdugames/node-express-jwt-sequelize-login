'use strict';
module.exports = (sequelize, DataTypes) => {
  const JwtUserSessions = sequelize.define('JwtUserSessions', {
    userId: DataTypes.UUID,
    jwt: DataTypes.STRING(900)
  }, {});
  JwtUserSessions.associate = function(models) {
    JwtUserSessions.belongsTo(models.User, {foreignKey: 'userId'});
  };
  return JwtUserSessions;
};