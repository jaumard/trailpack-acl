'use strict'

const Model = require('trails/model')

/**
 * @module ItemOwners
 * @description ItemOwners model
 */
module.exports = class ItemOwners extends Model {

  static config(app, Sequelize) {
  }

  static schema(app, Sequelize) {
    return {
      owner_id: {
        type: Sequelize.INTEGER,
        unique: 'item_owner_ownable'
      },
      ownable: {
        type: Sequelize.STRING,
        unique: 'item_owner_ownable'
      },
      ownable_id: {
        type: Sequelize.INTEGER,
        unique: 'item_owner_ownable',
        references: null
      }
    }
  }
}

