'use strict'

const Model = require('trails-model')

module.exports = class Role extends Model {
  static config(app, Sequelize) {
    return {
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

  static schema(app, Sequelize) {
    return {
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
}
