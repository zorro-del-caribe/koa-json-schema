const test = require('tape');
const koa = require('koa');
const validator = require('../index');
const request = require('supertest');
const http = require('http');

test('validate query parameters', t=> {
  const app = new koa()
    .use(validator({
      type: 'object',
      properties: {
        foo: {
          type: 'string',
          maxLength: 3
        }
      }
    }));

  request(http.createServer(app.callback()))
    .get('/?foo=3463')
    .expect(422)
    .end(function (err, res) {
      t.error(err);
      t.end();
    });
});


test('validate query parameters', t=> {
  const app = new koa()
    .use(validator({
      type: 'object',
      properties: {
        foo: {
          type: 'string',
          maxLength: 3
        }
      }
    }))
    .use(function (ctx) {
      ctx.body = {foo: 'bar'};
    });

  request(http.createServer(app.callback()))
    .get('/?foo=3')
    .expect(200)
    .end(function (err, res) {
      t.error(err);
      t.equal(res.body.foo, 'bar');
      t.end();
    });
});

test('validate query parameters', t=> {
  const app = new koa()
    .use(async function (ctx, next) {
      try {
        await next();
      } catch (e) {
        ctx.status = e.status;
        ctx.body = e.error_description;
      }
    })
    .use(validator({
      type: 'object',
      properties: {
        foo: {
          type: 'string',
          maxLength: 3
        }
      }
    }))
    .use(function (ctx) {
      t.fail();
    });

  request(http.createServer(app.callback()))
    .get('/?foo=3sfsf')
    .expect(422)
    .end(function (err, res) {
      t.error(err);
      t.deepEqual(res.body, [{
          dataPath: '.foo',
          keyword: 'maxLength',
          message: 'should NOT be longer than 3 characters',
          params: {limit: 3},
          schemaPath: '#/properties/foo/maxLength'
        }]
      );
      t.end();
    });
});
