'use strict';

var memory = require('../')('mock:memory', ['items']);

memory.items.insert({_id: 'foo', val: 5});
memory.items.find({}).then(function (res) {
  assert(res.length === 1 && res[0]._id === 'foo');
});
memory.items.find({val: {$gt: 3}}).then(function (res) {
  assert(res.length === 1 && res[0]._id === 'foo');
});
memory.items.find({val: {$lt: 3}}).then(function (res) {
  assert(res.length === 0);
});

var file = require('../')('mock:test/data.json', ['items']);

file.items.insert({_id: Date.now() + '', val: 5});
memory.items.find({}).then(function (res) {
  assert(res.length > 0);
});
