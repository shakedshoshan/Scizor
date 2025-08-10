import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Handler, Context, APIGatewayProxyEvent, APIGatewayProxyResult, Callback } from 'aws-lambda';
// Use require to avoid ESM/CJS default import interop issues in Lambda runtime
// eslint-disable-next-line @typescript-eslint/no-var-requires
const serverlessExpress = require('@vendia/serverless-express');

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for API Gateway
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  });
  
  // Note: controller already uses `@Controller('ai')`, so no global prefix here
  
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
