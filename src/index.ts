import * as assert from 'assert';
import * as Ajv from 'ajv';
import {Context} from 'koa';

export interface ValidationError {
    error_description: Array<Ajv.ErrorObject>;
}

export const middleware = (schema: object, options?: Ajv.Options) => {
    assert(schema, 'schema must be provided');
    const ajv = new Ajv(options || {});
    const validate = ajv.compile(schema);

    return async (ctx: Context, next: Function) => {
        // @ts-ignore
        const data = Object.assign({}, ctx.request.query || {}, ctx.request.body || {}, ctx.params || {});
        const isValid = validate(data);
        if (!isValid) {
            ctx.throw(422, 'invalid inputs', {error_description: validate.errors});
        }
        await next();
    };
};
