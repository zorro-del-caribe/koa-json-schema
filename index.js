const assert = require('assert');
const Ajv = require('ajv');

module.exports = function (schema, options = {}) {
  assert(schema, 'schema must be provided');
  const ajv = new Ajv(options);
  const validate = ajv.compile(schema);

  return async function (ctx, next) {
    const data = Object.assign({}, ctx.request.query, ctx.request.body, ctx.params);
    const isValid = validate(data);
    if (!isValid) {
      ctx.throw(422, 'invalid inputs', {error_description: validate.errors});
    }
    await next();
  }
};
