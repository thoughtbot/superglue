'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/superglue.cjs');
} else {
  module.exports = require('./cjs/superglue.development.cjs');
}
