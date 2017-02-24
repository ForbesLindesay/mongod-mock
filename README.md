# mongod-mock

[![Greenkeeper badge](https://badges.greenkeeper.io/ForbesLindesay/mongod-mock.svg)](https://greenkeeper.io/)

Mock mongod

[![Build Status](https://img.shields.io/travis/ForbesLindesay/mongod-mock/master.svg)](https://travis-ci.org/ForbesLindesay/mongod-mock)
[![Dependency Status](https://img.shields.io/david/ForbesLindesay/mongod-mock.svg)](https://david-dm.org/ForbesLindesay/mongod-mock)
[![NPM version](https://img.shields.io/npm/v/mongod-mock.svg)](https://www.npmjs.org/package/mongod-mock)

## Installation

    npm install mongod-mock

## Usage

In memory:

```js
var db = require('mongod-mock')('mock:memory');

// use db
```

With a file (only written every 500ms at most, and won't work with multiple processes):

```js
var db = require('mongod-mock')('mock:my-file.json');

// use db
```

Lots of operations are not supported, but this should work for simple demos

## License

  MIT
