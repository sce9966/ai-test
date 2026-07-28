import * as Joi from 'joi';

/**
 * 环境变量校验 Schema。
 * DB / Redis / JWT 通过 `.env` 指向已有实例与密钥配置。
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(3000),
  DB_HOST: Joi.string().default('127.0.0.1'),
  DB_PORT: Joi.number().port().default(3306),
  DB_USERNAME: Joi.string().default('root'),
  DB_PASSWORD: Joi.string().allow('').default('change_me'),
  DB_DATABASE: Joi.string().default('admin_template'),
  DB_SYNCHRONIZE: Joi.boolean().truthy('true').falsy('false').default(false),
  REDIS_HOST: Joi.string().default('127.0.0.1'),
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  REDIS_DB: Joi.number().integer().min(0).default(0),
  JWT_SECRET: Joi.string().min(16).default('change_me_jwt_secret_dev'),
  JWT_EXPIRES_IN: Joi.string().default('2h'),
  AUTH_DEFAULT_TENANT_ID: Joi.string().default('default'),
  AUTH_SEED_DEMO_USER: Joi.boolean().truthy('true').falsy('false').default(false),
  AUTH_DEMO_USERNAME: Joi.string().default('admin'),
  AUTH_DEMO_PASSWORD: Joi.string().default('Admin@123456'),
});
