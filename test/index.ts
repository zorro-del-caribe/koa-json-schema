import {test} from 'zora';
import * as koa from 'koa';
import {middleware as validator} from '../src/index';
import * as request from 'supertest';
import {createServer} from 'http';

test('validate query parameters: return HTTP 422 status if input is invalid', async t => {
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

    const res = await request(createServer(app.callback()))
        .get('/?foo=3463')
        .expect(422);

    t.ok(res);
});

test('validate query parameters: go through if input is valid', async t => {
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

    const res = await request(createServer(app.callback()))
        .get('/?foo=3')
        .expect(200);

    t.eq(res.body, {foo: 'bar'});
});

test('validate query parameters: invalid input should provide a meaningful error description', async t => {
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

    const res = await request(createServer(app.callback()))
        .get('/?foo=3sfsf')
        .expect(422);

    t.eq(res.body, [{
        dataPath: '.foo',
        keyword: 'maxLength',
        message: 'should NOT be longer than 3 characters',
        params: {limit: 3},
        schemaPath: '#/properties/foo/maxLength'
    }]);
});
