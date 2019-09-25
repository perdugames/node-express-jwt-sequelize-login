const fs = require('fs');
const path = require('path');

const helpers = {};

function toCamel(s) {
  return s.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
};

fs.readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== path.basename(__filename)) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    helpers[toCamel(file.replace('.js', ''))] = require(path.join(__dirname, file));
  });

module.exports = helpers;
