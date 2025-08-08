# Output the URL of our deployed API endpoint so we can test it.
output "invoke_url" {
  value = "${aws_api_gateway_stage.hello_world_stage.invoke_url}/${aws_api_gateway_resource.hello_world_resource.path_part}"
}
