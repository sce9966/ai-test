import * as Joi from 'joi';

/**
 * 环境变量校验 Schema。
 * DB / Redis 通过 `.env` 指向已有实例；启动时做完整性校验。
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
});
