'use strict'
const _ = require('lodash')
const smokesignals = require('smokesignals')
const ModelPassport = require('trailpack-passport/api/models/User')
const ModelPermissions = require('../api/models/User')
const Model = require('trails-model')
const Controller = require('trails-controller')

const App = {
  pkg: {
    name: 'acl-trailpack-test',
    version: '1.0.0'
  },
  api: {
    controllers: {
      TestController: class TestController extends Controller {
        success(req, res){
          res.status(200).end()
        }
        failure(req, res){
          res.status(400).end()
        }
      }
    },
    models: {
      User: class User extends ModelPassport {
        static config(app, Sequelize) {
          return {
            options: {
              classMethods: {
                associate: (models) => {
                  ModelPassport.config(app, Sequelize).options.classMethods.associate(models)
                  ModelPermissions.config(app, Sequelize).options.classMethods.associate(models)
                  models.User.belongsToMany(models.Item, {
                    as: 'items',
                    through: 'UserItem'
                  })
                }
              }
            }
          }
        }
      },
      Item: class Item extends Model {
        static config(app, Sequelize) {
          return {
            options: {
              classMethods: {
                associate: (models) => {
                  models.Item.belongsToMany(models.User, {
                    as: 'owners',
                    through: 'UserItem'
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
              allowNull: false
            }
          }
        }
      }
    }
  },
  config: {
    database: {
      stores: {
        sqlite: {
          database: 'TireFax',
          storage: './test/test.sqlite',
          host: '127.0.0.1',
          dialect: 'sqlite'
        }
      },

      models: {
        defaultStore: 'sqlite',
        migrate: 'drop'
      }
    },
    passport: {
      strategies: {
        //Enable local strategy
        local: {
          strategy: require('passport-local').Strategy,
          options: {
            usernameField: 'username'// If you want to enable both username and email just remove this field
          }
        }
      }
    },
    routes: [
      {
        method: 'GET',
        path: '/success/public/permissions',
        handler: 'TestController.success',
        config: {
          app: {
            permissions: {
              resourceName: 'successRoute',
              roles: ['public']
            }
          }
        }
      },
      {
        method: 'GET',
        path: '/failure/public/permissions',
        handler: 'TestController.failure',
        config: {
          app: {
            permissions: {
              resourceName: 'failureRoute',
              roles: ['test']
            }
          }
        }
      },
      {
        method: 'GET',
        path: '/success/logged/permissions',
        handler: 'TestController.success',
        config: {
          app: {
            permissions: {
              resourceName: 'successLoggedRoute',
              roles: ['test']
            }
          }
        }
      },
      {
        method: 'GET',
        path: '/failure/logged/permissions',
        handler: 'TestController.failure',
        config: {
          app: {
            permissions: {
              resourceName: 'failureLoggedRoute',
              roles: ['admin']
            }
          }
        }
      }
    ],
    permissions: {
      defaultRole: 'public',
      modelsAsResources: true,
      fixtures: {
        roles: [{
          name: 'test',
          publicName: 'test'
        }, {
          name: 'admin',
          publicName: 'Admin'
        }, {
          name: 'public' ,
          publicName: 'Public'
        }],
        resources: [{
          type: 'route',
          name: 'fixture',
          publicName: 'fixture'
        }],
        permissions: [{
          roleName: 'test',
          resourceName: 'fixture',
          action: 'action'
        }, {
          roleName: 'test',
          relation: 'owner',
          resourceName: 'item',
          action: 'access'
        }, {
          roleName: 'test',
          relation: 'owner',
          resourceName: 'item',
          action: 'create'
        }, {
          roleName: 'test',
          relation: 'owner',
          resourceName: 'item',
          action: 'update'
        }, {
          roleName: 'test',
          relation: 'owner',
          resourceName: 'item',
          action: 'destroy'
        }, {
          roleName: 'admin',
          resourceName: 'item',
          action: 'access'
        }, {
          roleName: 'admin',
          relation: 'owner',
          resourceName: 'item',
          action: 'create'
        }, {
          roleName: 'admin',
          relation: 'owner',
          resourceName: 'item',
          action: 'update'
        }, {
          roleName: 'admin',
          relation: 'owner',
          resourceName: 'item',
          action: 'destroy'
        }]
      }
    },
    footprints: {
      controllers: false,
      prefix: '/api'
    },
    policies: {
      '*': ['CheckPermissions.checkRoute'],
      'FootprintController': ['CheckPermissions.checkModel']
    },
    main: {
      packs: [
        smokesignals.Trailpack,
        require('trailpack-core'),
        require('trailpack-router'),
        require('trailpack-express'),
        require('trailpack-sequelize'),
        require('trailpack-passport'),
        require('trailpack-footprints'),
        require('../') // trailpack
      ]
    },
    session: {
      secret: 'ok'
    },
    web: {
      express: require('express'),
      middlewares: {
        order: [
          'addMethods',
          'cookieParser',
          'session',
          'passportInit',
          'passportSession',
          'bodyParser',
          'compression',
          'methodOverride',
          'www',
          'router'
        ]
      }
    }
  }
}

_.defaultsDeep(App, smokesignals.FailsafeConfig)
module.exports = App
