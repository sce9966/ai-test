import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NAMESPACE } from '../../config/main';

const swaggerOptions = new DocumentBuilder()
  .setTitle('OpenKey API')
  .setDescription('OpenKey API 文档')
  .setVersion('1.0.0')
  .addBearerAuth()
  .build();

/**
 * 注册 Swagger 文档路由。
 *
 * @param app Nest 应用实例
 */
export function createSwagger(app: INestApplication): void {
  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup(`/${NAMESPACE}/swagger/docs`, app, document);
}
