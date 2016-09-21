# trailpack-acl
[![Gitter][gitter-image]][gitter-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![NPM version][npm-image]][npm-url]
[![NPM downloads][npm-download]][npm-url]
[![Build status][ci-image]][ci-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Code Climate][codeclimate-image]][codeclimate-url]
[![Beerpay](https://beerpay.io/jaumard/trailpack-acl/make-wish.svg?style=flat)](https://beerpay.io/jaumard/trailpack-acl)
[![Beerpay](https://beerpay.io/jaumard/trailpack-acl/badge.svg?style=flat)](https://beerpay.io/jaumard/trailpack-acl)

:package: Trailpack to manage permissions (ACL) on your Trails projects

### WARNING : 

This Trailpack work only with [trailpack-express](https://github.com/trailsjs/trailpack-express) as webserver 

This Trailpack work only with [trailpack-sequelize](https://github.com/trailsjs/trailpack-sequelize) as ORM

## Intallation
With yo : 

```
npm install -g yo generator-trails
yo trails:trailpack trailpack-acl
```

With npm (you will have to create config file manually) :
 
`npm install --save trailpack-acl`

## Configuration

First you need to add this trailpack to your __main__ configuration : 
```js
// config/main.js

module.exports = {
   ...

   packs: [
      ...
      require('trailpack-acl'),
      ...
   ]
   ...
}
```

Then permissions config :  
```js
// config/permissions.js
  defaultRole: null, //Role name to use for anonymous users
  userRoleFieldName: 'roles', // Name of the association field for Role under User model
  modelsAsResources: true, // Set all your models as resources automatically when initialize the database
  //Initial data added when DB is empty
  fixtures: {
    roles: [],
    resources: [],
    permissions: []
  }
```

You also need to have a User model like: 

```
const Model = require('trails-model')
const ModelPassport = require('trailpack-passport/api/models/User') // If you use trailpack-pasport
const ModelPermissions = require('trailpack-acl/api/models/User')
class User extends Model {
  static config(app, Sequelize) {
    return {
      options: {
        classMethods: {
          associate: (models) => {
            // Apply passport specific stuff
            ModelPassport.config(app, Sequelize).options.classMethods.associate(models) 
            // Apply permission specific stuff
            ModelPermissions.config(app, Sequelize).options.classMethods.associate(models)
            // Apply your specific stuff
            
          }
        }
      }
    }
  }
  static schema(app, Sequelize) {
    return {your stuff}
  }
}
```

## Usage

### Manage roles
Use the native sequelize model under `this.app.orm.Roles`, if you need initial roles just add them on permissions config file under `fixtures.roles`.

### Manage resources
Use the native sequelize model under `this.app.orm.Resources`, if you need initial resources just add them on permissions config file under `fixtures.resources`.

### Manage model permissions
#### Static declaration under config
```
//config/permissions.js
fixtures: {
    roles: [{
      name: 'roleName',
      publicName: 'Role name'
    }],
    resources: [{
      type: 'model',
      name: 'modelName',
      publicName: 'Model name'
    }],
    permissions: [{
       roleName: 'roleName',
       resourceName: 'modelName',
       action: 'create'
     }, {
       roleName: 'roleName',
       resourceName: 'modelName',
       action: 'update'
     }, {
       roleName: 'roleName',
       resourceName: 'modelName',
       action: 'destroy'
     }, {
       roleName: 'roleName',
       resourceName: 'modelName',
       action: 'access'
     }]
  }
```

#### Owner permissions
This trailpack can manage owner permissions on model instance, to do this you need to declare your permissions like this : 
```
{
  roleName: 'roleName',
  relation: 'owner',
  resourceName: 'modelName',
  action: 'create'
}
```
You can create this permisions with sequelize model, with fixtures options or with PermissionService like this : 
```
this.app.services.PermissionService.grant('roleName', 'modelName', 'create', 'owner').then(perm => () => {})
.catch(err => this.app.log.error(err))
```

Then you need to declare an `owners` attributes on your models like this : 
```
module.exports = class Item extends Model {
  static config(app, Sequelize) {
    return {
      options: {
        classMethods: {
          associate: (models) => {
            models.Item.belongsToMany(models.User, {
              as: 'owners',
              through: 'UserItem'//If many to many is needed
            })
          }
        }
      }
    }
  }
}
```
If the model is under a trailpack and you don't have access to it you can add a model with same name on your project, 
let do this for the model User witch is already in trailpack-permissions and trailpack-passport:
 
```
const ModelPassport = require('trailpack-passport/api/models/User')
const ModelPermissions = require('../api/models/User')
const Model = require('trails-model')
module.exports = class User extends Model {
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
  static schema(app, Sequelize) {
      const UserTrailpackSchema = ModelPassport.schema(app, Sequelize)
      let schema = {
        //All your attributes here
      }
      return _.defaults(UserTrailpackSchema, schema)//merge passport attributs with your
    }
}
```
Like this you can add owners permissions on all models you want.

WARNING ! Currently owner permissions are not supported for `update` `destroy` actions on multiple items (with no ID) 

#### Dynamically with PermissionService
```
// Grant a permission to create 'modelName' to 'roleName'
this.app.services.PermissionService.grant('roleName', 'modelName', 'create').then(perm => () => {})
.catch(err => this.app.log.error(err))

// Revoke a permission to create 'modelName' to 'roleName'
this.app.services.PermissionService.revoke('roleName', 'modelName', 'create').then(perm => () => {})
.catch(err => this.app.log.error(err))
```

### Manage route permissions
Route permissions can be added directly under route definition : 
```
{
  method: 'GET',
  path: '/api/myroute',
  handler: 'DefaultController.myroute',
  config: {
    app: {
      permissions: {
        resourceName: 'myrouteId',
        roles: ['roleName']
      }
    }
  }
}
```
When the DB is empty all routes permissions will be created, if you make any change after this you'll have to update permissions yourself, they are only create in DB when it's empty.

You can always use PermissionService anytime you want to grant or revoke routes permissions.

### Policies 
You have 2 policies to manage permissions, they return a 403 when user is not allowed : 

#### CheckPermissions.checkRoute
This one will check your route permissions, if they're no permissions than the route is accessible. 
The easy way to setup is : 

```
//config/policies.js
'*': [ 'CheckPermissions.checkRoute' ]
//or
ViewController: [ 'CheckPermissions.checkRoute' ] 

```

#### CheckPermissions.checkModel
This one will check your model permissions, if there no permissions models are not accessible
```
//config/policies.js
FootprintController: [ 'CheckPermissions.checkModel' ] // To check permissions on models
```

## License
[MIT](https://github.com/jaumard/trailpack-acl/blob/master/LICENSE)


[snyk-image]: https://snyk.io/test/github/jaumard/trailpack-acl/badge.svg
[snyk-url]: https://snyk.io/test/github/jaumard/trailpack-acl/
[npm-image]: https://img.shields.io/npm/v/trailpack-acl.svg?style=flat-square
[npm-url]: https://npmjs.org/package/trailpack-acl
[npm-download]: https://img.shields.io/npm/dt/trailpack-acl.svg
[ci-image]: https://travis-ci.org/jaumard/trailpack-acl.svg?branch=master
[ci-url]: https://travis-ci.org/jaumard/trailpack-acl
[daviddm-image]: http://img.shields.io/david/jaumard/trailpack-acl.svg?style=flat-square
[daviddm-url]: https://david-dm.org/jaumard/trailpack-acl
[codeclimate-image]: https://img.shields.io/codeclimate/github/jaumard/trailpack-acl.svg?style=flat-square
[codeclimate-url]: https://codeclimate.com/github/jaumard/trailpack-acl
[gitter-image]: http://img.shields.io/badge/+%20GITTER-JOIN%20CHAT%20%E2%86%92-1DCE73.svg?style=flat-square
[gitter-url]: https://gitter.im/trailsjs/trails

## Support on Beerpay
Hey dude! Help me out for a couple of :beers:!

[![Beerpay](https://beerpay.io/jaumard/trailpack-acl/badge.svg?style=beer-square)](https://beerpay.io/jaumard/trailpack-acl)  [![Beerpay](https://beerpay.io/jaumard/trailpack-acl/make-wish.svg?style=flat-square)](https://beerpay.io/jaumard/trailpack-acl?focus=wish)
