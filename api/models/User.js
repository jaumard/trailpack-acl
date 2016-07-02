'use strict'

const Model = require('trails-model')

module.exports = class User extends Model {
  static config(app, Sequelize) {
    return {
      options: {
        classMethods: {
          associate: (models) => {
            models.User.belongsToMany(models.Role, {
              as: 'roles',
              through: 'UserRole'
            })
          }
        }
      }
    }
  }

  static schema(app, Sequelize) {
    return {

    }
  }
}
