import * as Joi from 'joi';

/**
 * 环境变量校验 Schema。
 * DB / Redis 为可选占位字段，缺失时使用配置默认值；本阶段不要求真实可达。
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(3000),
  DB_HOST: Joi.string().optional(),
  DB_PORT: Joi.number().port().optional(),
  DB_USERNAME: Joi.string().optional(),
  DB_PASSWORD: Joi.string().allow('').optional(),
  DB_DATABASE: Joi.string().optional(),
  REDIS_HOST: Joi.string().optional(),
  REDIS_PORT: Joi.number().port().optional(),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  REDIS_DB: Joi.number().integer().min(0).optional(),
});
