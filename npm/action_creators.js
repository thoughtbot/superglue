'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/action_creators.cjs')
} else {
  module.exports = require('./cjs/action_creators.development.cjs')
}
