'use strict';

var Promise = require('promise');
var clone = require('clone');
var match = require('mongomatch');
var manip = require('manip');

function result(obj) {
  return Promise.resolve(clone(obj));
}

module.exports = Collection;

function Collection(data, onUpdate) {
  this.data = data || [];
  this.onUpdate = onUpdate;
}
Collection.prototype.count = function (query) {
  return this.find(query).count();
};
Collection.prototype.find = function (query) {
  if (query) {
    return result(this.data.filter(match.bind(null, query)));
  } else {
    return result(this.data);
  }
};
Collection.prototype.findOne = function (query) {
  for (var i = 0; i < this.data.length; i++) {
    if (match(query, this.data[i])) {
      return result(this.data[i]);
    }
  }
  return result(null);
};
Collection.prototype.insert = function (document) {
  if (!document && typeof document !== 'object') {
    return Promise.reject(new TypeError('Documents must be objects'));
  }
  if (typeof document._id !== 'string') {
    return Promise.reject(new TypeError('mongod-mock requires IDs to be strings at the moment.'));
  }
  if (this.data.some(function (doc) { return doc._id === document._id; })) {
    return Promise.reject(new Error('Document already exists.'));
  }
  this.data.push(document);
  this.onUpdate(this.data);
  return result(null);
};
Collection.prototype.remove = function (query, justOne) {
  var done = false;
  this.data = this.data.filter(function (obj) {
    if (done) return true;
    if (match(query, obj)) {
      done = justOne;
      return false;
    }
    return true;
  });
  this.onUpdate(this.data);
  return result(null);
};
Collection.prototype.update = function (query, update, options) {
  options = options || {};
  if (options.upsert && (query._id !== update._id || typeof query._id !== 'string')) {
    return Promise.reject(new Error('mongo-mock only supports upsert when both query and update specify a value for _id'));
  }
  var updated = 0, upserted = 0;
  for (var i = 0; i < this.data.length && (options.multi || updated === 0); i++) {
    if (match(query, this.data[i])) {
      manip(this.data[i], update);
      updated++;
    }
  }
  if (options.upsert && updated === 0) {
    var obj = {};
    manip(obj, update);
    this.data.push(obj);
    upserted++;
  }
  this.onUpdate(this.data);
  return result({
    nModified: updated,
    n: updated + upserted
  });
};

function Cursor(data) {
  this.data = data;
}
Cursor.prototype.then = function (cb) {
  return result(this.data).then(cb);
};
Object.keys(Promise.prototype).forEach(function (key) {
  if (!(key in Cursor.prototype)) {
    Cursor.prototype[key] = Promise.prototype[key];
  }
});

Cursor.prototype.sort = function (sorter) {
  var keys = Object.keys(sorter);
  if (keys.length !== 1) {
    return Promise.reject(new Error('Cannot sort on multiple keys'));
  }
  return new Cursor(this.data.sort(function (a, b) {
    if (a[keys[0]] < b[keys[0]]) return -sorter[keys[0]];
    if (a[keys[0]] > b[keys[0]]) return sorter[keys[0]];
    return 0;
  }));
};
Cursor.prototype.skip = function (n) {
  return new Cursor(this.data.slice(n));
};
Cursor.prototype.limit = function (n) {
  return new Cursor(this.data.slice(0, n));
};
Cursor.prototype.count = function () {
  return result(this.length);
};
Cursor.prototype.toArray = function () {
  return result(this.data);
};
