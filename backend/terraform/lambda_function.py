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
