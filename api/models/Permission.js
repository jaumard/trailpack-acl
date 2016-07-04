'use strict'

const Model = require('trails-model')

module.exports = class Permission extends Model {
  static config(app, Sequelize) {
    return {
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

  static schema(app, Sequelize) {
    const sEnum = Sequelize.ENUM
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
      },
      relation: {
        type: sEnum('owner')
      }
    }
  }
}
