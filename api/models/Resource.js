'use strict'

const Model = require('trails-model')

module.exports = class Resource extends Model {
  static config(app, Sequelize) {
    let config = {}

    if (app.config.database.orm === 'sequelize') {
      config = {
        //More informations about supported models options here : http://docs.sequelizejs.com/en/latest/docs/models-definition/#configuration
        options: {
          classMethods: {
            associate: (models) => {
              models.Resource.hasMany(models.Permission, {
                as: 'permissions',
                onDelete: 'CASCADE',
                foreignKey: {
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
      schema =  {
        type: {
          type: 'string',
          enum: ['model', 'route', 'other'],
          defaultsTo: 'other',
          required: true
        },
        publicName: {
          type: 'string',
          required: true
        },
        name: {
          type: 'string',
          primaryKey: true,
          required: true
        },
        description: {
          type: 'string',
        },
        permissions: {
          collection: 'Permission',
          via: 'resource'
        }
      }
    }
    else if (app.config.database.orm === 'sequelize') {
      const sEnum = Sequelize.ENUM
      schema =  {
        type: {
          type: sEnum('model', 'route', 'other'),
          defaultValue: 'other',
          allowNull: false
        },
        publicName: {
          type: Sequelize.STRING,
          allowNull: false
        },
        name: {
          type: Sequelize.STRING,
          primaryKey: true,
          allowNull: false
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
