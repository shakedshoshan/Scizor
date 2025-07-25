Scizor Project: Detailed Action Plan
This document outlines a detailed, step-by-step action plan for developing the Scizor application, starting with the backend, integrating Firebase Authentication on the frontend, and covering deployment, testing, and monitoring.

Phase 1: Backend Development (Nest.js, AWS Lambda, API Gateway, OpenAI Integration)
Goal: Develop and deploy the core AI proxy backend service.

Project Setup & Version Control:

Create a new GitHub repository for the backend (e.g., scizor-backend).

Initialize a new Nest.js project within the repository: nest new scizor-backend.

Set up initial Git commit and push to GitHub.

Nest.js Core AI Module Development:

Install Dependencies:

npm install @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs

npm install openai (for OpenAI API interaction)

npm install @nestjs/config (for environment variables/secrets)

npm install @nestjs/swagger swagger-ui-express (for API documentation)

npm install class-validator class-transformer (for DTO validation)

Create AiModule:

Define AiController with endpoints: POST /ai/enhance-prompt, POST /ai/generate-response.

Define AiService to encapsulate OpenAI API calls.

Implement DTOs (EnhancePromptDto, GenerateResponseDto) with validation decorators.

Implement basic error handling for OpenAI API calls within the service.

OpenAI Integration:

Write logic in AiService to make calls to the OpenAI API using the openai client.

For now, hardcode a placeholder for the OpenAI API key (will be replaced by Secrets Manager later).

Basic API Documentation: Integrate Swagger to automatically generate API documentation.

Local Backend Testing:

Unit Tests: Write Jest unit tests for AiService methods, mocking the openai client.

Integration Tests: Write Jest/Supertest integration tests for AiController endpoints, ensuring correct request/response flow and error handling.

Ensure high test coverage for core logic.

Initial Serverless Deployment Setup (AWS Lambda & API Gateway):

Install Serverless Framework: npm install -g serverless

Configure Serverless: Create a serverless.yml file in your Nest.js project root.

Define the Nest.js application as a Lambda function (e.g., using @vendia/serverless-express or serverless-http).

Configure API Gateway to expose the Lambda function via the defined endpoints.

Set up basic IAM roles for Lambda to allow logging to CloudWatch.

Manual Deployment (for initial verification): serverless deploy --stage dev

AWS Secrets Manager Integration:

Create Secret: Manually create a secret in AWS Secrets Manager (e.g., scizor/openai_api_key) and store your OpenAI API key.

Update Nest.js: Modify AiService to retrieve the OpenAI API key from environment variables injected by Lambda, which will in turn fetch it from Secrets Manager.

Update serverless.yml: Configure the Lambda function's environment variables to reference the Secrets Manager secret.

Update IAM: Add necessary IAM permissions to the Lambda's execution role to allow secretsmanager:GetSecretValue on your specific secret.

Backend Monitoring Setup:

CloudWatch Logs: Verify that Lambda logs are streaming to CloudWatch Logs.

X-Ray: Enable X-Ray tracing for API Gateway and Lambda in serverless.yml to visualize request flow.

Custom Metrics (Optional for MVP): If desired, add logic in AiService to publish custom metrics (e.g., AI call duration, success/failure rate) to CloudWatch.

Phase 2: Infrastructure as Code (Terraform)
Goal: Automate the provisioning and management of all AWS backend infrastructure.

Terraform Project Setup:

Create a new directory for Terraform (e.g., terraform/).

Initialize Terraform: terraform init.

Configure remote state in main.tf to use an S3 bucket and DynamoDB for locking.

Define AWS provider.

Define AWS Resources in Terraform:

VPC & Networking: Define a basic VPC, subnets, and security groups for the Lambda function and (future) RDS.

IAM Roles & Policies: Define the IAM role for the Lambda function with permissions for CloudWatch Logs and Secrets Manager access.

Secrets Manager: Define the scizor/openai_api_key secret in Terraform.

Lambda Function: Define the Lambda function resource, linking it to the code package (which will be built by CI/CD) and the IAM role.

API Gateway: Define the API Gateway REST API, resources (/ai/enhance-prompt, /ai/generate-response), methods (POST), and integration with the Lambda function.

Outputs: Define outputs for the API Gateway endpoint URL.

Terraform Testing & Validation:

Run terraform plan to review proposed changes.

Apply changes: terraform apply.

Verify resources are created correctly in the AWS Console.

Phase 3: CI/CD Pipeline (GitHub Actions)
Goal: Automate build, test, and deployment processes for the backend.

GitHub Actions Workflow Setup:

Create .github/workflows/backend.yml in your backend repository.

Define Triggers: On push to main and pull_request to main.

Define Environment Variables: AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) as GitHub Secrets.

Build Stage:

Checkout code.

Set up Node.js.

Install dependencies.

Run ESLint/Prettier.

Run Nest.js build (npm run build).

Run Unit and Integration Tests.

Package Lambda deployment artifact (e.g., zip -r deployment.zip .).

Upload artifact.

Terraform Plan Stage:

Checkout code.

Set up Terraform.

terraform init.

terraform plan -out=tfplan.

Upload tfplan artifact.

Deployment Stage (Conditional):

Add a job that depends on successful build and plan.

For Dev/Staging: Automate terraform apply tfplan and Lambda update on pushes to feature branches.

For Production: Require manual approval for terraform apply tfplan and Lambda update on pushes to main.

Use AWS CLI or Serverless Framework commands to deploy the Lambda function.

Post-Deployment Checks:

Use curl or a simple Python script to hit the deployed API Gateway endpoints and verify functionality (smoke test).

Phase 4: Frontend Development (PyQt6 with Firebase Auth)
Goal: Develop the desktop application with Firebase authentication and AI integration.

Project Setup & Version Control:

Create a new GitHub repository for the frontend (e.g., scizor-frontend).

Initialize a Python project.

Set up initial Git commit and push.

PyQt6 Basic UI & Core Functionality:

Install Dependencies: pip install PyQt6 pyperclip keyboard pywin32 requests

Main Application Window: Create the basic dashboard layout (clipboard history list, notes area, AI interaction buttons).

Clipboard Management: Implement pyperclip monitoring in a QThread or QTimer. Store history in SQLite.

Notes System: Implement SQLite database setup (scizor.db), basic CRUD operations for notes.

Global Hotkeys: Implement keyboard library integration in a separate thread.

Firebase Authentication Integration:

Firebase Project Setup: Create a new project in the Firebase Console. Enable Email/Password authentication.

Frontend Firebase SDK: Decide on the Python Firebase client library. firebase-admin is for backend, so you might need to use requests to interact directly with Firebase Auth REST API endpoints (e.g., sign-up, sign-in, get ID token).

Authentication UI: Create login and registration screens within your PyQt6 app.

Token Management: After successful login, retrieve the Firebase ID token. Store it securely (e.g., in an encrypted local file, or in memory for the session).

Inject Token: When making requests to your Nest.js backend for protected resources (like future note sync or if AI endpoints become protected), include the Firebase ID token in the Authorization: Bearer <ID_TOKEN> header.

AI Integration with Backend:

HTTP Requests: Use the requests library to make POST requests to your deployed AWS API Gateway endpoints.

Error Handling: Implement robust error handling for network issues and API errors, displaying user-friendly messages.

Loading Indicators: Add UI feedback (e.g., "Processing..." message, spinner) while waiting for AI responses.

Advanced Frontend Features (MVP):

Configuration: Implement a settings window to configure clipboard interval, history size, hotkeys, and AI model selection. Store settings in SQLite or a config file.

Theming: Implement dark/light theme switching using QSS.

System Tray: Implement minimize-to-tray functionality and a right-click context menu.

Phase 5: Deployment & Maintenance
Goal: Ensure the application is deployable, stable, and maintainable.

Frontend Packaging:

Use PyInstaller to package the PyQt6 application into a standalone executable for Windows.

Test the packaged application thoroughly.

Monitoring & Alerting Refinement:

Review CloudWatch dashboards.

Set up CloudWatch Alarms for critical backend metrics (e.g., Lambda errors, high latency, OpenAI API errors) with SNS notifications.

Implement basic logging within the PyQt6 app (e.g., to a local log file) for debugging frontend issues.

Documentation:

Create a README.md for both backend and frontend repositories with setup instructions, usage, and architecture overview.

Document API endpoints and DTOs (Swagger will help for backend).

Future Enhancements (Post-MVP):

User Data Synchronization: Implement backend endpoints for notes and clipboard history, protected by Firebase ID token verification.

Rate Limiting: Implement API Gateway rate limiting for AI endpoints.

Custom AI Models: Explore deploying custom AI models on AWS SageMaker or other services.

Cross-Platform Support: Extend frontend to macOS/Linux.

Desktop Notifications: Integrate system-level notifications for certain events.

This detailed plan provides a structured approach to building Scizor, allowing you to showcase your full-stack and backend development capabilities effectively.