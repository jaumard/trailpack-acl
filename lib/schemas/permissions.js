const joi = require('joi')

module.exports = joi.object().keys({
  defaultRole: joi.string(),
  userRoleFieldName: joi.string().required(),
  modelsAsResources: joi.boolean().required(),
  fixtures: joi.object().keys({
    roles: joi.array(),
    resources: joi.array(),
    permissions: joi.array()
  }).required()
})
