'use strict'

const lib = require('./')
const _ = require('lodash')

module.exports = {
  buildRoutesFixtures: app => {
    const fixtures = {
      resources: [],
      permissions: []
    }

    app.config.routes.forEach(route => {
      const config = _.get(route.config, 'app.permissions')
      if (config && config.roles && config.resourceName) {
        if (_.isString(config.roles)) {
          config.roles = [config.roles]
        }
        fixtures.resources.push({
          type: 'route',
          name: config.resourceName,
          publicName: config.resourceName
        })
        config.roles.forEach(role => {
          fixtures.permissions.push({
            resourceName: config.resourceName,
            roleName: role,
            action: 'access'
          })
        })
      }
    })
    return Promise.resolve(fixtures)
  },

  loadFixtures: app => {
    return Promise.all([
      app.services.FootprintService.find('role', {}).then(roles => {
        if (!roles || roles.length === 0) {
          return lib.Utils.loadRoles(app)
        }
      }),
      app.services.FootprintService.find('resource', {}).then(resources => {
        if (!resources || resources.length === 0) {
          return lib.Utils.loadResources(app)
        }
      })
    ]).then(results => {
      return app.services.FootprintService.find('permission', {}).then(permissions => {
        if (!permissions || permissions.length === 0) {
          return lib.Utils.loadPermissions(app)
        }
      })
    })
  },

  loadRoles: app => {
    const roles = app.config.permissions.fixtures.roles
    if (roles.length > 0) {
      return app.orm.Role.bulkCreate(roles)
    }
  },

  loadResources: app => {
    let resources = app.config.permissions.fixtures.resources.concat(app.packs.acl.routesFixtures.resources)
    if (app.config.permissions.modelsAsResources) {
      const models = []
      Object.keys(app.orm).forEach(modelName => {
        models.push({
          type: 'model',
          name: modelName.toLowerCase(),
          publicName: modelName
        })
      })
      resources = resources.concat(models)
    }
    if (resources.length > 0) {
      return app.orm.Resource.bulkCreate(resources).catch(err => {
        this.app.log.error(err)
      })
    }
  },

  loadPermissions: app => {
    const permissions = app.config.permissions.fixtures.permissions.concat(app.packs.acl.routesFixtures.permissions)
    if (permissions.length > 0) {
      return app.orm.Permission.bulkCreate(permissions)
    }
  }

}
