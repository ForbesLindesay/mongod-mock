'use strict';

var fs = require('fs');
var path = require('path');
var Collection = require('./lib/memory-collection.js');

module.exports = mongod;
function mongod(connection, collections) {
  if (typeof connection !== 'string' || connection.substr(0, 5) !== 'mock:') {
    throw new TypeError('connection must be a string starting with mock:');
  }
  if (!Array.isArray(collections) || !collections.every(function (c) { return typeof c === 'string'; })) {
    throw new TypeError('collections must be an Array.<String>');
  }
  var result = {};
  if (connection.substr(5) === 'memory') {
    collections.forEach(function (name) {
      result[name] = new Collection([], function () {});
    });
  } else {
    var filename = path.resolve(connection.substr(5));
    var src = '{}';
    try {
      src = fs.readFileSync(filename, 'utf8');
    } catch (ex) {
      if (ex.code !== 'ENOENT') {
        throw ex;
      }
    }
    var data = JSON.parse(src);
    var writing = false;
    var saving = false;
    var save = function () {
      if (saving) return;
      saving = true;
      setTimeout(function () {
        saving = false;
        if (writing) return save();
        writing = true;
        fs.writeFile(filename, JSON.stringify(data, null, '  '), function (err) {
          writing = false;
          if (err) throw err;
        });
      }, 500);
    };
    collections.forEach(function (name) {
      result[name] = new Collection(data[name] || [], function (updated) {
        data[name] = updated;
        save();
      });
    });
  }
  return result;
}
