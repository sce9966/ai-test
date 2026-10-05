import * as Joi from 'joi';

/**
 * 环境变量校验 Schema。
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(3000),
  APIPREFIX: Joi.string().default('/api'),
  SWAGGERPREFIX: Joi.string().default('/docs'),
  NAMESPACE: Joi.string().default('openkey'),

  DB_HOST: Joi.string().optional(),
  DB_PORT: Joi.number().port().optional(),
  DB_USERNAME: Joi.string().optional(),
  DB_USER: Joi.string().optional(),
  DB_PASSWORD: Joi.string().allow('').optional(),
  DB_PASS: Joi.string().allow('').optional(),
  DB_DATABASE: Joi.string().optional(),
  DB_SYNCHRONIZE: Joi.string().valid('true', 'false').optional(),

  REDIS_HOST: Joi.string().optional(),
  REDIS_PORT: Joi.number().port().optional(),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  REDIS_USER: Joi.string().allow('').optional(),
  REDIS_DB: Joi.number().integer().min(0).optional(),

  JWT_SECRET: Joi.string().optional(),
  JWT_EXPIRESIN: Joi.string().optional(),

  COS_BUCKET: Joi.string().allow('').optional(),
  COS_REGION: Joi.string().allow('').optional(),
  COS_SECRET_ID: Joi.string().allow('').optional(),
  COS_SECRET_KEY: Joi.string().allow('').optional(),
  COS_ACCELERATED_DOMAIN: Joi.string().allow('').optional(),

  WECHAT_MINI_APPID: Joi.string().allow('').optional(),
  WECHAT_MINI_SECRET: Joi.string().allow('').optional(),
});
