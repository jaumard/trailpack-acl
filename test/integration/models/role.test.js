'use strict'
/* global describe, it */

const assert = require('assert')

describe('Role', () => {
  it('should exist', () => {
    assert(global.app.api.models['Role'])
    assert(global.app.orm['Role'])
  })

  it('should add Roles', () => {
    return global.app.orm.Role.bulkCreate([{
      name: 'user',
      publicName: 'User'
    }]).then(roles => {
      assert.equal(roles.length, 1)
      assert.equal(roles[0].name, 'user')
    })
  })
})
