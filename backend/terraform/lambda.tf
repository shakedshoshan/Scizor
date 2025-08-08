# Create a simple Lambda function code file
resource "local_file" "lambda_code" {
  content  = <<-EOT
import json
def handler(event, context):
  print('request: {}'.format(event))
  return {
    'statusCode': 200,
    'headers': {
      'Content-Type': 'application/json'
    },
    'body': json.dumps('Hello from your Serverless API!')
  }
EOT
  filename = "${path.module}/lambda_function.py"
}

# Archive the Lambda function code
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = local_file.lambda_code.filename
  output_path = "${path.module}/lambda_function_payload.zip"
  depends_on  = [local_file.lambda_code]
}

# Create the Lambda Function
resource "aws_lambda_function" "hello_world_lambda" {
  function_name    = "hello-world-lambda"
  handler          = "lambda_function.handler"
  runtime          = "python3.9"
  role             = aws_iam_role.lambda_exec_role.arn
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
}

# Grant API Gateway permission to invoke the Lambda function
resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowAPIGatewayToInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.hello_world_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  
  # The source ARN ensures that only our specific API Gateway can invoke the function.
  source_arn = "${aws_api_gateway_rest_api.hello_world_api.execution_arn}/*/*"
}
