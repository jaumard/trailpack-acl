'use strict'

const Model = require('trails-model')

module.exports = class Resource extends Model {
  static config(app, Sequelize) {
    return {
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

  static schema(app, Sequelize) {
    const sEnum = Sequelize.ENUM
    return {
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
}
