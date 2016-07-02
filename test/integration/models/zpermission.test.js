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
      RoleName: 'admin',
      ResourceName: 'res1',
      action: 'create'
    }, {
      RoleName: 'user',
      ResourceName: 'res1',
      action: 'create'
    }, {
      RoleName: 'public',
      ResourceName: 'res3',
      action: 'access'
    }, {
      RoleName: 'public',
      ResourceName: 'permission',
      action: 'access'
    }]).then(permissions => {
      assert.equal(permissions.length, 4)
      assert.equal(permissions[0].RoleName, 'admin')
      assert.equal(permissions[0].ResourceName, 'res1')
      assert.equal(permissions[0].action, 'create')
      assert.equal(permissions[1].RoleName, 'user')
      assert.equal(permissions[1].ResourceName, 'res1')
      assert.equal(permissions[1].action, 'create')
      assert.equal(permissions[2].RoleName, 'public')
      assert.equal(permissions[2].ResourceName, 'res3')
      assert.equal(permissions[2].action, 'access')
      assert.equal(permissions[3].RoleName, 'public')
      assert.equal(permissions[3].ResourceName, 'permission')
      assert.equal(permissions[3].action, 'access')
    })
  })
})
