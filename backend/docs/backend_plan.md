Scizor Backend: Detailed Structure & Action Instructions
This document provides a detailed breakdown of the Scizor backend project structure and specific action-oriented instructions for its implementation, focusing on Nest.js, AWS Lambda, API Gateway, and OpenAI integration.

1. Backend Project Structure
The Nest.js backend will follow a modular structure, typical for Nest.js applications, with dedicated modules for AI functionality and future user/notes synchronization.

scizor-backend/
├── src/
│   ├── main.ts                   # Application entry point
│   ├── app.module.ts             # Root application module
│   ├── app.controller.ts         # Root controller (can be removed if no root endpoints)
│   ├── app.service.ts            # Root service (can be removed)
│   │
│   ├── ai/                       # AI Module
│   │   ├── ai.module.ts          # AI module definition
│   │   ├── ai.controller.ts      # Handles AI-related HTTP requests
│   │   ├── ai.service.ts         # Contains AI logic and OpenAI API calls
│   │   ├── dto/                  # Data Transfer Objects for AI requests
│   │   │   ├── enhance-prompt.dto.ts
│   │   │   └── generate-response.dto.ts
│   │   └── test/                 # AI module tests
│   │       ├── ai.controller.spec.ts
│   │       └── ai.service.spec.ts
│   │
│   ├── auth/                     # (Future) Authentication Module
│   │   ├── auth.module.ts
│   │   ├── firebase-auth.guard.ts # Custom guard for Firebase ID token verification
│   │   └── ...
│   │
│   ├── notes/                    # (Future) Notes Module (for cloud sync)
│   │   ├── notes.module.ts
│   │   ├── notes.controller.ts
│   │   ├── notes.service.ts
│   │   ├── entities/notes.entity.ts # TypeORM/Prisma entity
│   │   └── ...
│   │
│   └── common/                   # Common utilities, filters, interceptors
│       └── exceptions/
│           └── http-exception.filter.ts # Global exception filter
│
├── test/
│   └── app.e2e-spec.ts           # End-to-end tests
│
├── .env.example                  # Example environment variables
├── .eslintrc.json                # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── jest-e2e.json                 # Jest configuration for E2E tests
├── jest.config.js                # Jest configuration
├── package.json                  # Project dependencies and scripts
├── serverless.yml                # Serverless Framework configuration for AWS Lambda deployment
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # Project README

2. Specific Action Instructions for Backend Development
Follow these steps in order to build out the Scizor backend.

2.1. Initial Project Setup
Create Nest.js Project:

Open your terminal/command prompt.

Run nest new scizor-backend. Choose npm as the package manager.

Navigate into the new directory: cd scizor-backend.

Initialize Git & GitHub Repository:

git init

git add .

git commit -m "Initial Nest.js project setup"

Create a new private repository on GitHub (e.g., scizor-backend).

Link your local repository to the remote:
git remote add origin https://github.com/your-username/scizor-backend.git
git branch -M main
git push -u origin main

2.2. Develop Core AI Module
Install Dependencies:

npm install @nestjs/config openai class-validator class-transformer @nestjs/swagger swagger-ui-express

npm install --save-dev @types/express (if not already installed by Nest)

Generate AI Module:

nest g module ai

nest g controller ai --no-spec (we'll create spec files manually for better control)

nest g service ai --no-spec

Define DTOs (src/ai/dto/):

Create enhance-prompt.dto.ts:

// src/ai/dto/enhance-prompt.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class EnhancePromptDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;
}

Create generate-response.dto.ts:

// src/ai/dto/generate-response.dto.ts
import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class GenerateResponseDto {
  @IsString()
  @IsNotEmpty()
  input: string; // The text to generate a response from

  @IsString()
  @IsNotEmpty()
  @IsIn(['General', 'Educational', 'Code', 'Creative', 'Analytical', 'Step-by-Step', 'Fun'])
  responseType: string; // Type of response requested
}

Implement AiService (src/ai/ai.service.ts):

Import OpenAI from openai.

Inject ConfigService from @nestjs/config to access environment variables (for API key).

Create an OpenAI client instance.

Implement enhancePrompt method:

Takes prompt: string as input.

Calls openai.chat.completions.create with a system message guiding the AI to enhance prompts.

Returns the enhanced prompt.

Implement generateResponse method:

Takes input: string, responseType: string as input.

Calls openai.chat.completions.create with a system message tailored to the responseType.

Returns the generated response.

Add basic try-catch blocks for OpenAI API calls to handle potential errors.

For now, retrieve the OpenAI API key directly from process.env.OPENAI_API_KEY.

// src/ai/ai.service.ts
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { EnhancePromptDto } from './dto/enhance-prompt.dto';
import { GenerateResponseDto } from './dto/generate-response.dto';

@Injectable()
export class AiService {
  private readonly openai: OpenAI;
  private readonly logger = new Logger(AiService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.error('OPENAI_API_KEY is not set in environment variables.');
      throw new InternalServerErrorException('OpenAI API key not configured.');
    }
    this.openai = new OpenAI({ apiKey });
  }

  async enhancePrompt(dto: EnhancePromptDto): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // Or gpt-4, depending on your access and needs
        messages: [
          {
            role: 'system',
            content: 'You are an AI prompt enhancer. Your goal is to take a user\'s raw prompt and make it more specific, clear, and contextual for another AI model. Do not add conversational text, just output the enhanced prompt.',
          },
          {
            role: 'user',
            content: dto.prompt,
          },
        ],
      });
      return completion.choices[0]?.message?.content || 'Could not enhance prompt.';
    } catch (error) {
      this.logger.error(`Error enhancing prompt: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to enhance prompt.');
    }
  }

  async generateResponse(dto: GenerateResponseDto): Promise<string> {
    let systemMessage = '';
    switch (dto.responseType) {
      case 'General':
        systemMessage = 'You are a helpful assistant. Provide a concise and relevant response.';
        break;
      case 'Educational':
        systemMessage = 'You are an educator. Explain the concept clearly and provide examples.';
        break;
      case 'Code':
        systemMessage = 'You are a coding assistant. Provide code snippets and explanations for the given problem.';
        break;
      case 'Creative':
        systemMessage = 'You are a creative writer. Generate an imaginative and original response.';
        break;
      case 'Analytical':
        systemMessage = 'You are an analyst. Break down the input, identify key components, and provide a logical analysis.';
        break;
      case 'Step-by-Step':
        systemMessage = 'You are a guide. Provide a clear, numbered, step-by-step instruction set.';
        break;
      case 'Fun':
        systemMessage = 'You are a playful and humorous AI. Provide a lighthearted and entertaining response.';
        break;
      default:
        systemMessage = 'You are a helpful assistant.';
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // Or gpt-4
        messages: [
          {
            role: 'system',
            content: systemMessage,
          },
          {
            role: 'user',
            content: dto.input,
          },
        ],
      });
      return completion.choices[0]?.message?.content || 'Could not generate response.';
    } catch (error) {
      this.logger.error(`Error generating response: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to generate response.');
    }
  }
}

Implement AiController (src/ai/ai.controller.ts):

Import AiService and DTOs.

Decorate methods with @Post() and @Body() for request validation.

Add @ApiTags('AI') and @ApiOperation() decorators for Swagger documentation.

  // src/ai/ai.controller.ts
  import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
  import { AiService } from './ai.service';
  import { EnhancePromptDto } from './dto/enhance-prompt.dto';
  import { GenerateResponseDto } from './dto/generate-response.dto';
  import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

  @ApiTags('AI')
  @Controller('ai')
  export class AiController {
    constructor(private readonly aiService: AiService) {}

    @Post('enhance-prompt')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Enhance a user prompt using AI' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Prompt successfully enhanced.' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Failed to enhance prompt.' })
    async enhancePrompt(@Body() enhancePromptDto: EnhancePromptDto): Promise<{ enhancedPrompt: string }> {
      const enhancedPrompt = await this.aiService.enhancePrompt(enhancePromptDto);
      return { enhancedPrompt };
    }

    @Post('generate-response')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Generate an AI response based on input and type' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Response successfully generated.' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Failed to generate response.' })
    async generateResponse(@Body() generateResponseDto: GenerateResponseDto): Promise<{ response: string }> {
      const response = await this.aiService.generateResponse(generateResponseDto);
      return { response };
    }
  }

Configure AiModule (src/ai/ai.module.ts):

Import AiController and AiService.

Add them to imports, controllers, and providers arrays.

Import ConfigModule to make ConfigService available.

// src/ai/ai.module.ts
import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule], // Import ConfigModule to use ConfigService
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}

Integrate AiModule into AppModule (src/app.module.ts):

Import AiModule.

Add AiModule to the imports array of AppModule.

Add ConfigModule.forRoot({ isGlobal: true }) to AppModule to make environment variables globally available.

// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './ai/ai.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available throughout the app
    }),
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

Configure Swagger (src/main.ts):

Add Swagger setup code to main.ts for API documentation.

// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation pipe globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Automatically remove non-whitelisted properties
    forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
    transform: true, // Automatically transform payloads to DTO instances
  }));

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Scizor AI Backend API')
    .setDescription('API for AI-powered prompt enhancement and response generation for Scizor desktop app.')
    .setVersion('1.0')
    .addTag('AI')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Access at /api

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

Create .env.example:

Add OPENAI_API_KEY=your_openai_api_key_here to this file.

Important: Add .env to .gitignore to prevent committing your actual API key.

2.3. Local Backend Testing
Create Test Files (src/ai/test/):

src/ai/test/ai.service.spec.ts (Unit tests for AiService)

src/ai/test/ai.controller.spec.ts (Integration tests for AiController)

Write Unit Tests for AiService:

Mock the OpenAI client to control its behavior during tests.

Test enhancePrompt and generateResponse methods for success and error cases.

Write Integration Tests for AiController:

Use Test.createTestingModule and request(app.getHttpServer()) from supertest.

Send actual HTTP requests to the controller endpoints.

Verify response status codes, body, and error handling.

Run Tests:

npm run test (for unit tests)

npm run test:e2e (for e2e tests, which you'll expand later)

2.4. Initial Serverless Deployment Setup
Install Serverless Framework:

npm install -g serverless

Create serverless.yml in project root:

Define service name, provider (AWS), runtime, and region.

Define the Lambda function (aiApi) and its handler (e.g., dist/main.handler).

Configure API Gateway events for your /ai/enhance-prompt and /ai/generate-response endpoints.

Set up basic IAM roles for CloudWatch logging.

Crucial: Use @vendia/serverless-express or serverless-http to wrap your Nest.js app for Lambda.

Install: npm install @vendia/serverless-express

Modify src/main.ts to export the handler:

// src/main.ts (updated for serverless)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { configure as configureServerlessExpress } from '@vendia/serverless-express';
import { INestApplication } from '@nestjs/common';

let cachedServer: INestApplication;

async function bootstrap() {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    const config = new DocumentBuilder()
      .setTitle('Scizor AI Backend API')
      .setDescription('API for AI-powered prompt enhancement and response generation for Scizor desktop app.')
      .setVersion('1.0')
      .addTag('AI')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.init();
    cachedServer = app;
  }
  return cachedServer;
}

// Export the handler for AWS Lambda
export const handler = configureServerlessExpress({
  app: async () => (await bootstrap()).getHttpAdapter().getInstance(),
});

// For local development (optional, if you still want to run locally with npm run start:dev)
if (process.env.NODE_ENV !== 'production' && process.env.IS_LOCAL !== 'true') {
  bootstrap().then(app => app.listen(3000));
}

Example serverless.yml:

# serverless.yml
service: scizor-ai-backend

frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs18.x # Or nodejs20.x
  region: us-east-1 # Choose your desired AWS region
  stage: ${opt:stage, 'dev'} # Default stage is 'dev'
  apiGateway:
    minimumCompressionSize: 1024 # Enable gzip compression for responses > 1KB
  environment:
    NODE_ENV: ${self:provider.stage}
    # OPENAI_API_KEY will be injected via Secrets Manager later
  iam:
    role:
      statements:
        - Effect: "Allow"
          Action:
            - "logs:CreateLogGroup"
            - "logs:CreateLogStream"
            - "logs:PutLogEvents"
          Resource: "arn:aws:logs:${aws:region}:${aws:accountId}:log-group:/aws/lambda/*:*"
        - Effect: "Allow"
          Action:
            - "xray:PutTraceSegments"
            - "xray:PutTelemetryRecords"
          Resource: "*" # X-Ray permissions
        # Placeholder for Secrets Manager permissions (will be added in Phase 1.5)

package:
  individually: true
  patterns:
    - '!./**' # Exclude everything
    - './dist/**' # Include compiled Nest.js output
    - './node_modules/**' # Include node_modules
    - '!./node_modules/@types/**' # Exclude dev dependencies from node_modules

functions:
  aiApi:
    handler: dist/main.handler # Points to the exported handler in main.ts
    events:
      - http:
          path: ai/enhance-prompt
          method: post
          cors: true # Enable CORS for frontend access
      - http:
          path: ai/generate-response
          method: post
          cors: true # Enable CORS for frontend access
    memorySize: 256 # Adjust based on AI model size/usage
    timeout: 30 # Adjust based on expected AI response time
    tracing: Active # Enable X-Ray tracing

plugins:
  - serverless-offline # For local testing (optional)
  - serverless-plugin-optimize # To optimize Lambda package size (optional)

Manual Deployment:

Ensure your AWS CLI is configured with credentials.

npm run build (to compile Nest.js)

serverless deploy --stage dev

Note the API Gateway endpoint URL from the output. Test it with curl or Postman.

2.5. AWS Secrets Manager Integration
Manually Create Secret in AWS Console:

Go to AWS Secrets Manager.

Click "Store a new secret".

Choose "Other type of secret".

Enter {"OPENAI_API_KEY": "your_actual_openai_api_key"}.

Name the secret scizor/openai_api_key.

Update serverless.yml for Secret Access:

Add the following to the iam.role.statements section of your serverless.yml:

# ... inside provider.iam.role.statements
- Effect: "Allow"
  Action:
    - "secretsmanager:GetSecretValue"
  Resource: "arn:aws:secretsmanager:${aws:region}:${aws:accountId}:secret:scizor/openai_api_key-*" # Use wildcard for version suffix

Add the secret reference to the environment section of your aiApi function:

# ... inside functions.aiApi
environment:
  OPENAI_API_KEY: ${ssm:/aws/reference/secretsmanager/scizor/openai_api_key~json:OPENAI_API_KEY}

Note: This uses SSM parameter store syntax to pull the secret value. Ensure serverless-plugin-aws-secrets or similar is installed if you encounter issues, though recent Serverless versions often handle this natively.

Redeploy Backend:

serverless deploy --stage dev

Verify that the Lambda function now correctly retrieves the API key from Secrets Manager.

2.6. Backend Monitoring Setup
Verify CloudWatch Logs:

After deploying and making requests, go to CloudWatch -> Log groups.

You should see a log group like /aws/lambda/scizor-ai-backend-dev-aiApi.

Check log streams for Lambda execution logs and any this.logger.error messages from your AiService.

Verify X-Ray Tracing:

Go to AWS X-Ray -> Service map.

You should see a map showing requests flowing from API Gateway to your Lambda function, and potentially to the external OpenAI service (though external calls might not show detailed segments without deeper integration).

Analyze traces for latency and errors.

Implement Custom Metrics (Optional):

In AiService, after a successful or failed OpenAI call, use the AWS SDK to put custom metrics:

// Example in AiService (after successful call)
// import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';
// ...
// const cloudWatch = new CloudWatchClient({ region: this.configService.get('AWS_REGION') });
// await cloudWatch.send(new PutMetricDataCommand({
//   Namespace: 'Scizor/AI',
//   MetricData: [{
//     MetricName: 'PromptEnhancementSuccess',
//     Value: 1,
//     Unit: 'Count',
//   }],
// }));

Add necessary IAM permissions to the Lambda role for cloudwatch:PutMetricData.

Create a custom dashboard in CloudWatch to visualize these metrics.

This detailed plan provides a solid foundation for your Scizor backend, focusing on practical steps and best practices.