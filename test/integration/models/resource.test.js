'use strict'
/* global describe, it */

const assert = require('assert')

describe('Resource', () => {
  it('should exist', () => {
    assert(global.app.api.models['Resource'])
    assert(global.app.orm['Resource'])
  })
  it('should add Resources', () => {
    return global.app.orm.Resource.bulkCreate([{
      type: 'model',
      name: 'res1',
      publicName: 'Res1'
    }, {
      type: 'route',
      name: 'res2' ,
      publicName: 'Res2'
    }, {
      type: 'controller',
      name: 'res3',
      publicName: 'Res3'
    }, {
      type: 'model',
      name: 'role',
      publicName: 'Role'
    }, {
      type: 'model',
      name: 'permission',
      publicName: 'Permission'
    }]).then(roles => {
      assert.equal(roles.length, 5)
      assert.equal(roles[0].name, 'res1')
      assert.equal(roles[1].name, 'res2')
      assert.equal(roles[2].name, 'res3')
      assert.equal(roles[3].name, 'role')
      assert.equal(roles[4].name, 'permission')
    })
  })
})
