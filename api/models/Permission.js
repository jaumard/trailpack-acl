'use strict'

const Model = require('trails-model')

module.exports = class Permission extends Model {
  static config(app, Sequelize) {
    let config = {}

    if (app && app.config.database.orm === 'sequelize') {
      config = {
        options: {
          classMethods: {
            associate: (models) => {
              models.Permission.belongsTo(models.Role, {
                as: 'role',
                onDelete: 'CASCADE',
                foreignKey: {
                  primaryKey: true,
                  name: 'roleName',
                  allowNull: false
                }
              })
              models.Permission.belongsTo(models.Resource, {
                as: 'resource',
                onDelete: 'CASCADE',
                foreignKey: {
                  primaryKey: true,
                  name: 'resourceName',
                  allowNull: false
                }
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
        action: {
          type: 'string',
          primaryKey: true,
          required: true
        },
        name: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        relation: {
          type: 'string',
          enum: ['owner']
        },
        role: {
          model: 'Role'
        },
        resource: {
          model: 'Resource'
        }
      }
    }
    else if (app && app.config.database.orm === 'sequelize') {
      const sEnum = Sequelize.ENUM
      schema = {
        action: {
          type: Sequelize.STRING,
          primaryKey: true,
          allowNull: false
        },
        name: {
          type: Sequelize.STRING,
          allowNull: true
        },
        description: {
          type: Sequelize.STRING,
          allowNull: true
        },
        relation: {
          type: sEnum('owner')
        }
      }
    }

    return schema
  }
}
