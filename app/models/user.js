'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
  });
  User.associate = function(models) {
    User.hasMany(models.JwtUserSessions, {foreignKey: 'userId'});
    User.hasMany(models.JwtResetPasswords, {foreignKey: 'userId'});
  }
  return User;
}
