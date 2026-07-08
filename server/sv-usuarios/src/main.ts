/**
 * Ponto de entrada do sv-usuarios. Cria a aplicação NestJS, habilita a
 * validação global de DTOs e publica a documentação Swagger em /docs.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 20/06/2026
 * Atualização: 07/07/2026
 */
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * Inicializa e sobe o servidor HTTP do serviço na porta configurada.
 * @returns Promise resolvida quando o servidor está ouvindo.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('sv-usuarios')
    .setDescription('Serviço de usuários e autenticação JWT')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Swagger: http://localhost:${port}/docs`);
}
bootstrap();
