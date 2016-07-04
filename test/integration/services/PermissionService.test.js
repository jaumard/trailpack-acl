'use strict'
/* global describe, it */

const assert = require('assert')

describe('PermissionService', () => {
  it('should exist', () => {
    assert(global.app.api.services['PermissionService'])
    assert(global.app.services['PermissionService'])
  })

  it('should return Role based on name', () => {
    return global.app.services.PermissionService.findRole('admin')
      .then(role => {
        assert.equal(role.name, 'admin')
      })
  })

  it('should return Resource based on name', () => {
    return global.app.services.PermissionService.findResource('res1')
      .then(resource => {
        assert.equal(resource.name, 'res1')
      })
  })

  it('should grant permission by name', () => {
    return global.app.services.PermissionService.grant('admin', 'res3', 'destroy')
      .then(permission => {
        assert.equal(permission.roleName, 'admin')
        assert.equal(permission.resourceName, 'res3')
        assert.equal(permission.action, 'destroy')
      })
  })

  it('should return permission on check permission', () => {
    return global.app.services.PermissionService.isAllowed('admin', 'res3', 'destroy')
      .then(permission => {
        assert.equal(permission.roleName, 'admin')
        assert.equal(permission.resourceName, 'res3')
        assert.equal(permission.action, 'destroy')
      })
  })

  it('should revoke permission by name', () => {
    return global.app.services.PermissionService.revoke('admin', 'res3', 'destroy')
      .then(_ => {
        return global.app.services.PermissionService.isAllowed('admin', 'res3', 'destroy').then(result => {
          assert(!result)//not allowed
        })
      })
  })
})
