'use strict'

const Policy = require('trails-policy')
const _ = require('lodash')

/**
 * @module CheckPermissionsPolicy
 * @description Check permission on the route or model
 */
module.exports = class CheckPermissionsPolicy extends Policy {
  checkModel(req, res, next) {
    const modelName = req.params.model
    const user = req.user
    const defaultRole = this.app.config.permissions.defaultRole

    let action = 'access'
    if (req.method === 'POST') {
      action = 'create'
    }
    else if (req.method === 'PUT' || req.method === 'PATCH') {
      action = 'update'
    }
    else if (req.method === 'DELETE') {
      action = 'destroy'
    }

    if (user) {
      this.app.services.PermissionService.isUserAllowed(user, modelName, action).then(permission => {
        if (!permission || permission.length === 0) {
          res.forbidden(`You doesn't have permissions to ${action} ${modelName}`)
        }
        else {
          if (action !== 'create' && permission[0].relation === 'owner') {
            if (action === 'access' || !req.params.id) {
              if (action === 'update' || action === 'destroy') {
                return next({
                  message: 'Update and Destroy are not yet supported with permissions, please do your request manually',
                  statusCode: 400,
                  code: 'E_UNSUPPORTED'
                })
              }
              //Override populate criteria to filter items
              if (modelName === 'user') {
                if (req.params.id === user.id) {
                  return next()
                }
                else {
                  res.forbidden(`You doesn't have permissions to ${action} ${modelName}`)
                }
              }
              else {
                req.query.populate = [{
                  model: this.app.orm.User,
                  as: 'owners',
                  required: true,
                  where: {id: req.user.id}
                }]
                return next()
              }
            }
            else {
              if (modelName === 'user') {
                if (req.params.id === user.id) {
                  return next()
                }
                else {
                  res.forbidden(`You doesn't have permissions to ${action} ${modelName}`)
                }
              }
              else {
                this.app.services.FootprintService.find(modelName, req.params.id, {populate: 'owners'}).then(item => {
                  for (let i = 0; i < item.owners.length; i++) {
                    if (item.owners[i].id === user.id) {
                      return next()
                    }
                  }
                  res.forbidden(`You doesn't have permissions to ${action} ${modelName}:${req.params.id}`)
                }).catch(err => {
                  this.app.log.error(err)
                  res.serverError(err)
                })
              }
            }
          }
          else {
            return next()
          }
        }
      }).catch(next)
    }
    else if (defaultRole) {
      this.app.services.PermissionService.isAllowed(defaultRole, modelName, action).then(permission => {
        if (!permission || permission.length === 0) {
          res.forbidden(`You doesn't have permissions to ${action} ${modelName}`)
        }
        else {
          return next()
        }
      }).catch(next)
    }
    else {
      res.forbidden(`You doesn't have permissions to ${action} ${modelName}`)
    }
  }

  checkRoute(req, res, next) {
    const user = req.user
    const defaultRole = this.app.config.permissions.defaultRole

    const permissionsConfig = _.get(req.route, 'config.app.permissions')

    if (!permissionsConfig) return next()

    if (user) {
      this.app.services.PermissionService.isUserAllowed(user, permissionsConfig.resourceName, 'access').then(permission => {
        if (!permission || permission.length === 0) {
          res.forbidden(`You doesn't have permissions to access ${req.originalUrl}`)
        }
        else {
          return next()
        }
      }).catch(next)
    }
    else if (defaultRole) {
      this.app.services.PermissionService.isAllowed(defaultRole, permissionsConfig.resourceName, 'access').then(permission => {
        if (!permission || permission.length === 0) {
          res.forbidden(`You doesn't have permissions to access ${req.originalUrl}`)
        }
        else {
          return next()
        }
      }).catch(next)
    }
    else {
      res.forbidden(`You doesn't have permissions to access ${req.originalUrl}`)
    }
  }
}

