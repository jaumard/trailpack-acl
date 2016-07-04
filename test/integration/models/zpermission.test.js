'use strict'
/* global describe, it */

const assert = require('assert')

describe('Permission', () => {
  it('should exist', () => {
    assert(global.app.api.models['Permission'])
    assert(global.app.orm['Permission'])
  })
  it('should add Permissions', () => {

    return global.app.orm.Permission.bulkCreate([{
      roleName: 'admin',
      resourceName: 'res1',
      action: 'create'
    }, {
      roleName: 'user',
      resourceName: 'res1',
      action: 'create'
    }, {
      roleName: 'public',
      resourceName: 'res3',
      action: 'access'
    }, {
      roleName: 'public',
      resourceName: 'permission',
      action: 'access'
    }]).then(permissions => {
      assert.equal(permissions.length, 4)
      assert.equal(permissions[0].roleName, 'admin')
      assert.equal(permissions[0].resourceName, 'res1')
      assert.equal(permissions[0].action, 'create')
      assert.equal(permissions[1].roleName, 'user')
      assert.equal(permissions[1].resourceName, 'res1')
      assert.equal(permissions[1].action, 'create')
      assert.equal(permissions[2].roleName, 'public')
      assert.equal(permissions[2].resourceName, 'res3')
      assert.equal(permissions[2].action, 'access')
      assert.equal(permissions[3].roleName, 'public')
      assert.equal(permissions[3].resourceName, 'permission')
      assert.equal(permissions[3].action, 'access')
    })
  })
})
