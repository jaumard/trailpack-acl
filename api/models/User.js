'use strict'

const Model = require('trails-model')

module.exports = class User extends Model {
  static config(app, Sequelize) {
    let config = {}

    if (app.config.database.orm === 'sequelize') {
      config = {
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
    return config
  }

  static schema(app, Sequelize) {
    let schema = {}

    if (app.config.database.orm === 'waterline') {
      schema = {
        roles: {
          collection: 'Role',
          via: 'users'
        }
      }
    }

    return schema
  }
}
