'use strict'
/* global describe, it */

const assert = require('assert')
const supertest = require('supertest')

describe('CheckPermission', () => {
  let request, agent

  before(done => {
    request = supertest('http://localhost:3000')
    agent = supertest.agent(global.app.packs.express.server)

    agent
      .post('/api/auth/local/register')
      .set('Accept', 'application/json') //set header for this test
      .send({username: 'jaumard', password: 'adminadmin', email: 'test@test.te'})
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.redirect, '/')
        assert.equal(res.body.user.id, 1)

        global.app.services.FootprintService.find('user', res.body.user.id).then(user => {
          return global.app.services.PermissionService.addRoleToUser(user, 'test')
        }).then(user => done()).catch(done)
      })
  })

  it('should exist', () => {
    assert(global.app.api.policies['CheckPermissions'])
    assert(global.app.policies['CheckPermissions'])
  })

  describe('CheckModelPermissions', () => {

    it('should check Model permissions on footprints', () => {
      return global.app.services.PermissionService.grant('test', 'role', 'access')
        .then(perms => {
          return new Promise((resolve, reject) => {
            agent.get('/api/role')
              .set('Accept', 'application/json') //set header for this test
              .expect(200)
              .end((err, res) => {
                if (err) return reject(err)
                assert.equal(res.body.length, 4)
                resolve()
              })
          })
        })
    })

    it('should check Model permissions on footprints', done => {
      agent.get('/api/resource')
        .set('Accept', 'application/json') //set header for this test
        .expect(403)
        .end((err, res) => {
          assert.equal(res.body.code, 'E_FORBIDDEN')
          assert.equal(res.body.message, 'You doesn\'t have permissions to access resource')
          done(err)
        })
    })

    it('should allow to retrieve Model with granted permissions on footprints for non logged users', done => {
      request.get('/api/permission')
        .set('Accept', 'application/json') //set header for this test
        .expect(200)
        .end((err, res) => {
          assert.equal(res.body.length, 18)
          done(err)
        })
    })

    it('should not allow to retrieve Model with no permissions on footprints for non logged users', done => {
      request.get('/api/resource')
        .set('Accept', 'application/json') //set header for this test
        .expect(403)
        .end((err, res) => {
          assert.equal(res.body.code, 'E_FORBIDDEN')
          assert.equal(res.body.message, 'You doesn\'t have permissions to access resource')
          done(err)
        })
    })
  })
  describe('CheckRoutePermissions', () => {
    it('should allow to access Route with granted permissions for non logged users', done => {
      request.get('/success/public/permissions')
        .expect(200)
        .end((err, res) => {
          done(err)
        })
    })

    it('should not allow to access Route with no permissions for non logged users', done => {
      request.get('/failure/public/permissions')
        .set('Accept', 'application/json') //set header for this test
        .expect(403)
        .end((err, res) => {
          assert.equal(res.body.code, 'E_FORBIDDEN')
          assert.equal(res.body.message, 'You doesn\'t have permissions to access /failure/public/permissions')
          done(err)
        })
    })

    it('should allow to access Route with granted permissions for logged users', done => {
      agent.get('/success/logged/permissions')
        .expect(200)
        .end((err, res) => {
          done(err)
        })
    })

    it('should not allow to access Route with no permissions for non logged users', done => {
      agent.get('/failure/logged/permissions')
        .set('Accept', 'application/json') //set header for this test
        .expect(403)
        .end((err, res) => {
          assert.equal(res.body.code, 'E_FORBIDDEN')
          assert.equal(res.body.message, 'You doesn\'t have permissions to access /failure/logged/permissions')
          done(err)
        })
    })
  })
  describe('CheckOwnersPermissions', () => {
    let adminAgent
    before(done => {
      adminAgent = supertest.agent(global.app.packs.express.server)

      adminAgent
        .post('/api/auth/local/register')
        .set('Accept', 'application/json') //set header for this test
        .send({username: 'admin', password: 'adminadmin', email: 'admin@admin.ad'})
        .expect(200)
        .end((err, res) => {
          assert.equal(res.body.redirect, '/')
          assert.equal(res.body.user.id, 2)

          global.app.services.FootprintService.find('user', res.body.user.id).then(user => {
            return global.app.services.PermissionService.addRoleToUser(user, 'admin')
          }).then(user => {
            return global.app.services.FootprintService.create('item', {
              name: 'test'
            }).then(item => {
              return item.addOwner(1)
            }).then(item => {
              return global.app.services.FootprintService.create('item', {
                name: 'test'
              })
            }).then(() => done()).catch(done)
          })
        })
    })

    it('should allow to access to Model Item with owner permission and return only items for the owner', done => {
      agent.get('/api/item')
        .set('Accept', 'application/json') //set header for this test
        .expect(200)
        .end((err, res) => {
          assert.equal(res.body.length, 1)
          assert.equal(res.body[0].id, 1)
          assert.equal(res.body[0].name, 'test')
          done(err)
        })
    })

    it('should allow to access to all Model Item with no owner permission and return only items for the owner', done => {
      adminAgent.get('/api/item')
        .set('Accept', 'application/json') //set header for this test
        .expect(200)
        .end((err, res) => {
          assert.equal(res.body.length, 2)
          done(err)
        })
    })

    it('should allow to update Model Item with owner permission', done => {
      agent.put('/api/item/1')
        .set('Accept', 'application/json') //set header for this test
        .send({
          name: 'testUpdated'
        })
        .expect(200)
        .end((err, res) => {
          assert.equal(res.body, 1)
          done(err)
        })
    })
    it('should not allow to update Model Item with owner permission on another user', done => {
      adminAgent.put('/api/item/1')
        .set('Accept', 'application/json') //set header for this test
        .send({
          name: 'testUpdatedWrong'
        })
        .expect(403)
        .end((err, res) => {
          assert.equal(res.body.code, 'E_FORBIDDEN')
          assert.equal(res.body.message, 'You doesn\'t have permissions to update item:1')
          done(err)
        })
    })

    //TODO currently not working because sequelize doesn't support include in update/destroy
    it.skip('should allow to bulk update Model Item with owner permission', done => {
      agent.put('/api/item')
        .set('Accept', 'application/json') //set header for this test
        .send({
          name: 'testUpdatedWrong'
        })
        .expect(200)
        .end((err, res) => {
          assert.equal(res.body[0], 1) // Only one row affected
          done(err)
        })
    })

    //TODO currently not working because sequelize doesn't support include in update/destroy
    it.skip('should allow to bulk update Model Item with owner permission on another user', done => {
      adminAgent.put('/api/item')
        .set('Accept', 'application/json') //set header for this test
        .send({
          name: 'testUpdatedWrong'
        })
        .expect(200)
        .end((err, res) => {
          assert.equal(res.body[0], 0) // No row affected for admin
          done(err)
        })
    })
  })
})
