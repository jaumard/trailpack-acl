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
      name: 'res2',
      publicName: 'Res2'
    }, {
      type: 'controller',
      name: 'res3',
      publicName: 'Res3'
    }]).then(resources => {
      assert.equal(resources.length, 3)
      assert.equal(resources[0].name, 'res1')
      assert.equal(resources[1].name, 'res2')
      assert.equal(resources[2].name, 'res3')
    })
  })

  it('should add models as Resources automatically', () => {
    return global.app.orm.Resource.find({
      where: {
        name: 'user'
      }
    }).then(res => {
      assert(res)
      assert.equal(res.name, 'user')
      assert.equal(res.type, 'model')
    })
  })
})
