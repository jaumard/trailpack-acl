'use strict'

const Service = require('trails-service')
const _ = require('lodash')

module.exports = class PermissionService extends Service {
  findRole(roleName) {
    return this.app.services.FootprintService.find('role', roleName)
  }

  findResource(resourceName) {
    return this.app.services.FootprintService.find('resource', resourceName)
  }

  grant(roleName, resourceName, actionName, relation) {
    return this.app.services.FootprintService.create('permission', {
      roleName: roleName,
      resourceName: resourceName,
      action: actionName,
      relation: relation || null
    }, {findOne: true})
  }

  revoke(roleName, resourceName, actionName) {
    return this.app.services.FootprintService.destroy('permission', {
      roleName: roleName,
      resourceName: resourceName,
      action: actionName
    })
  }

  isAllowed(roleName, resourceName, actionName) {
    return this.app.services.FootprintService.find('permission', {
      roleName: roleName,
      resourceName: resourceName,
      action: actionName
    }, {findOne: true})
  }

  isUserAllowed(user, resourceName, actionName) {
    if (this.app.config.database.orm === 'sequelize'){
      return this.app.services.FootprintService.findAssociation('user', user.id,
        _.get(this.app.config, 'permissions.userRoleFieldName', 'roles'))
        .then(roles => {

          const promises = []
          roles.forEach(role => {
            promises.push(this.isAllowed(role.name, resourceName, actionName))
          })
          return Promise.all(promises).then(permissions => {
            const perms = []
            permissions.forEach(perm => {
              if (perm != null) {
                perms.push(perm)
              }
            })
            return Promise.resolve(perms)
          })
        })
    }
    else if (this.app.config.database.orm === 'waterline') {
      return new Promise((done) => {
        this.app.orm.User.findOne({where: {id: user.id}}).populate('roles').exec((err, dbuser) => {
          if (!err){
            const roles = dbuser.roles
            const promises = []
            roles.forEach(role => {
              promises.push(this.isAllowed(role.name, resourceName, actionName))
            })
            Promise.all(promises).then(permissions => {
              const perms = []
              permissions.forEach(perm => {
                if (perm != null) {
                  perms.push(perm)
                }
              })
              done(perms)
            })
          }
          else {
            done(err)
          }
        })
      })
    }
  }

  addRoleToUser(user, roleName) {
    if (this.app.config.database.orm === 'sequelize') {
      user.addRole(roleName)
      return user.save()
    }
    else if (this.app.config.database.orm === 'waterline') {
      return new Promise((resolve, reject) => {
        this.app.orm.User.findOne({where: {id: user.id}}).populate('roles').exec((err, dbuser) => {
          if (!err){
            dbuser.roles.add(roleName)
            dbuser.save(() => resolve())
          }
          else {
            reject(err)
          }
        })
      })
    }
  }

  removeRoleToUser(user, roleName) {
    if (this.app.config.database.orm === 'sequelize') {
      user.removeRole(roleName)
      return user.save()
    }
    else if (this.app.config.database.orm === 'waterline') {
      return new Promise((resolve, reject) => {
        this.app.orm.User.findOne({where: {id: user.id}}).populate('roles').exec((err, dbuser) => {
          if (!err){
            dbuser.roles.remove(roleName)
            dbuser.save(() => resolve())
          }
          else {
            reject(err)
          }
        })
      })
    }
  }
}
