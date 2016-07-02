'use strict'

module.exports = {
  defaultRole: null, //Role name to use for anonymous users
  userRoleFieldName: 'roles', // Name of the association field for Role under User model
  //Initial data added when DB is empty
  fixtures: {
    roles: [],
    resources: [],
    permissions: []
  }
}
