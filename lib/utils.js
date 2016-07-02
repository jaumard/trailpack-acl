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
            ResourceName: config.resourceName,
            RoleName: role,
            action: 'access'
          })
        })
      }
    })
    return Promise.resolve(fixtures)
  },

  loadFixtures: app => {
    return Promise.all([
      app.services.FootprintService.find('role').then(roles => {
        if (!roles || roles.length === 0) {
          return lib.Utils.loadRoles(app)
        }
      }),
      app.services.FootprintService.find('resource').then(resources => {
        if (!resources || resources.length === 0) {
          return lib.Utils.loadResources(app)
        }
      })
    ]).then(results => {
      return app.services.FootprintService.find('permission').then(permissions => {
        if (!permissions || permissions.length === 0) {
          return lib.Utils.loadPermissions(app)
        }
      })
    })
  },

  loadRoles: app => {
    const roles = _.get(app.config, 'permissions.fixtures.roles')
    if (roles && roles.length > 0) {
      return app.orm.Role.bulkCreate(roles)
    }
  },

  loadResources: app => {
    const resources = _.get(app.config, 'permissions.fixtures.resources')
    if (resources && resources.length > 0) {
      return app.orm.Resource.bulkCreate(resources.concat(app.packs.acl.routesFixtures.resources))
    }
  },

  loadPermissions: app => {
    const permissions = _.get(app.config, 'permissions.fixtures.permissions')
    if (permissions && permissions.length > 0) {
      return app.orm.Permission.bulkCreate(permissions.concat(app.packs.acl.routesFixtures.permissions))
    }
  }

}
