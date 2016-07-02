'use strict'

const joi = require('joi')

const schemas = require('./schemas')

module.exports = {
  validateConfig (config) {
    return new Promise((resolve, reject) => {
      joi.validate(config, schemas.permissions, (err, value) => {
        if (err) return reject(new TypeError('config.permissions: ' + err))

        return resolve(value)
      })
    })
  }
}
