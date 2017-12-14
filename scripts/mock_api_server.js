var express = require('express');
const _ = require('underscore');
var cors = require('cors');
var process = require('process');
var http = require('http');
var https = require('https');
var fs = require('fs');

var app = express();
console.log('cors', cors());
//app.use(cors); // Use cors for all origins

http.createServer(app).listen(3002, function () {
  console.log('CORS-enabled web server listening on port 8000');
});

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
https.createServer(sslOptions, app).listen(8443);

var router = express.Router();

var whitelist = ['localhost'];
var corsOptions = {
  origin: function (origin, callback) {
    console.log('origin:', origin);
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET','POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 3600,
  preflightContinue: true
};

var issue2options = {
  origin: 'localhost', //true== CORS, // Bool | String | RegExp | Array
  methods: ['GET','POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 3600,
  preflightContinue: true
};
var defaultCorsConfig = {
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204
};


//, cors(corsOptions)
router.get('/', function (req, res) {
  hello = {'Hello': 'World'};
  return res.json(hello);
});

const corsOpts = {
  origin: 'http://127.0.0.1:3000',
  methods: ['GET','POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 3600,
  preflightContinue: true
};
router.get('/saksbehandler', cors(corsOptions), function (req, res) {
  try {
    const saksbehandlere =  JSON.parse(fs.readFileSync("./scripts/mock_data/saksbehandler.json", "utf8"));
    // return a random sakbehandler from list of sakbehandlere
    return res.json(_.sample(saksbehandlere));
  } catch (err) {
    console.log(err)
  }
});


app.use('/api', router);
