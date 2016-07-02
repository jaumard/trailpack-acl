# trailpack-acl
[![Gitter][gitter-image]][gitter-url]
[![NPM version][npm-image]][npm-url]
[![NPM downloads][npm-download]][npm-url]
[![Build status][ci-image]][ci-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Code Climate][codeclimate-image]][codeclimate-url]

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
const ModelPermissions = require('../api/models/User')
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
       RoleName: 'roleName',
       ResourceName: 'modelName',
       action: 'create'
     }, {
       RoleName: 'roleName',
       ResourceName: 'modelName',
       action: 'update'
     }, {
       RoleName: 'roleName',
       ResourceName: 'modelName',
       action: 'destroy'
     }, {
       RoleName: 'roleName',
       ResourceName: 'modelName',
       action: 'access'
     }]
  }
```

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
