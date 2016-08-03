const assert = require('assert');
const Ajv = require('ajv');

module.exports = function (schema, options = {}) {
  assert(schema, 'schema must be provided');
  const ajv = new Ajv(options);
  const validate = ajv.compile(schema);

  return function * (next) {
    const data = Object.assign({}, this.request.query, this.request.body, this.params);
    const isValid = validate(data);
    if (!isValid) {
      this.throw(422, 'invalid inputs', {error_description: validate.errors});
    }
    yield *next;
  }
};