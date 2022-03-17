#!/usr/bin/php
<?php
require_once('../path.inc');
require_once('../get_host_info.inc');
require_once('../rabbitMQLib.inc');

$client = new rabbitMQClient("testRabbitMQ.ini","testServer");
if (isset($argv[1]))
{
  $fileName = $argv[1];
}
else
{
  $fileName = "test.json";
}
$file = fopen($fileName, "r") or die("Could not open file");
$data = fread($file, filesize($fileName));

$request = json_decode($data);
echo $data;


$response = $client->send_request($request);
//$response = $client->publish($request);

echo "client received response: ".PHP_EOL;
print_r($response);
echo "\n\n";

echo $argv[0]." END".PHP_EOL;

