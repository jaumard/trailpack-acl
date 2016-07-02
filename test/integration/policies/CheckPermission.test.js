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
          assert.equal(res.body.length, 10)
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
})
