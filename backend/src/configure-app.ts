import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function configureApp(app: INestApplication) {
  const config = app.get(ConfigService);
  app.enableCors({ origin: config.getOrThrow<string>('FRONTEND_URL') });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  const swaggerEnabled = config.get<string>('SWAGGER_ENABLED') ?? String(process.env.NODE_ENV !== 'production');
  if (swaggerEnabled === 'true') {
    const definition = new DocumentBuilder()
      .setTitle('Campo Minado')
      .setDescription('Perfis de jogadores, registro de vitórias e ranking global.')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
      .build();
    SwaggerModule.setup('docs', app, () => SwaggerModule.createDocument(app, definition));
  }
}
