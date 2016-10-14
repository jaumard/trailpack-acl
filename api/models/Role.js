'use strict'

const Model = require('trails-model')

module.exports = class Role extends Model {
  static config(app, Sequelize) {
    let config = {}

    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          classMethods: {
            associate: (models) => {
              models.Role.hasMany(models.Permission, {
                as: 'permissions',
                onDelete: 'CASCADE',
                foreignKey: {
                  name: 'roleName',
                  allowNull: false
                }
              })
              models.Role.belongsToMany(models.User, {
                as: 'users',
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
        name: {
          type: 'string',
          primaryKey: true,
          required: true
        },
        publicName: {
          type: 'string',
          required: true
        },
        active: {
          type: 'boolean',
          defaultsTo: true,
          required: true
        },
        description: {
          type: 'string',
        },
        permissions: {
          collection: 'Permission',
          via: 'role'
        },
        users: {
          collection: 'User',
          via: 'roles'
        }
      }
    }
    else if (app && app.config.database.orm === 'sequelize') {
      schema = {
        name: {
          type: Sequelize.STRING,
          primaryKey: true,
          allowNull: false
        },
        publicName: {
          type: Sequelize.STRING,
          allowNull: false
        },
        active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        description: {
          type: Sequelize.STRING,
          allowNull: true
        }
      }
    }

    return schema
  }
}
