import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Handler, Context, APIGatewayProxyEvent, APIGatewayProxyResult, Callback } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for API Gateway
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  });
  
  // Set global prefix for API routes
  app.setGlobalPrefix('ai');
  
  await app.init();
  
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback?: Callback,
): Promise<APIGatewayProxyResult> => {
  server = server ?? (await bootstrap());
  const defaultCallback = callback || ((error: any, result: any) => {});
  return server(event, context, defaultCallback) as Promise<APIGatewayProxyResult>;
};
