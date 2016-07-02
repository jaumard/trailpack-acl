'use strict'

const Model = require('trails-model')

module.exports = class Permission extends Model {
  static config(app, Sequelize) {
    return {
      options: {
        classMethods: {
          associate: (models) => {
            models.Permission.belongsTo(models.Role, {
              onDelete: 'CASCADE',
              foreignKey: {
                primaryKey: true,
                allowNull: false
              }
            })
            models.Permission.belongsTo(models.Resource, {
              onDelete: 'CASCADE',
              foreignKey: {
                primaryKey: true,
                allowNull: false
              }
            })
          }
        }
      }
    }
  }

  static schema(app, Sequelize) {
    return {
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
      }
    }
  }
}
