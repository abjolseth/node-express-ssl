var express = require('express');
var process = require('process');
var http = require('http');
var https = require('https');
var fs = require('fs');

var server = express();

http.createServer(server).listen(8000);

var cwd = process.cwd();
var scripts = cwd + '/scripts';
console.log(cwd);

// Self signing certificate
// openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365
var sslOptions = {
  key: fs.readFileSync(scripts+'/key.pem'),
  cert: fs.readFileSync(scripts+'/cert.pem'),
  passphrase: 'melosys'
};
https.createServer(sslOptions, server).listen(8443);

var router = express.Router();

router.get('/', function (req, res) {
  hello = 'Hello World';
  return res.json(hello);
});
server.use('/api', router);
