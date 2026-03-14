import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '@app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const globalPrefix = configService.get<string>('app.globalPrefix') ?? '/api';
  app.setGlobalPrefix(globalPrefix);

  const versioningEnable = configService.get<boolean>('app.urlVersion.enable');
  if (versioningEnable) {
    app.enableVersioning({
      type: VersioningType.URI,
      prefix: configService.get<string>('app.urlVersion.prefix') ?? 'v',
      defaultVersion:
        configService.get<string>('app.urlVersion.version') ?? '1',
    });
  }

  app.enableCors({ origin: true });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Metric Tracking API')
    .setDescription('API for tracking health/fitness metrics')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const host = configService.get<string>('app.http.host') ?? 'localhost';
  const port = configService.get<number>('app.http.port') ?? 3000;

  await app.listen(port, host);

  console.log(
    `Application is running on: http://${host}:${port}${globalPrefix}`,
  );
}

void bootstrap();
