var express = require('express');
const _ = require('underscore');
var cors = require('cors');
var process = require('process');
var http = require('http');
var https = require('https');
var fs = require('fs');

const HTTP_PORT  = 3002;
const HTTPS_PORT = 8443;

var app = express();
//console.log('cors', cors());
//app.use(cors); // Use cors for all origins

http.createServer(app).listen(HTTP_PORT, function () {
  console.log('CORS-enabled web server listening on port '+HTTP_PORT);
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
https.createServer(sslOptions, app).listen(HTTPS_PORT, function () {
  console.log('CORS-enabled HTTPS web server listening on port '+HTTPS_PORT);
});

var router = express.Router();


var whitelist = ['http://localhost:3000', 'http://10.33.46.179'];
var corsOptions = {
  origin: function (origin, callback) {
    console.log('origin:', origin);
    //if (whitelist.indexOf(origin) !== -1) {
    if (whitelist.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET','POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'Accept-Charset'],
  credentials: true,
  maxAge: 3600,
  preflightContinue: true
};


router.get('/', cors(corsOptions), function (req, res) {
  hello = {'Hello': 'World'};
  return res.json(hello);
});

const corsOpts = {
  origin: 'http://localhost:3000',
  methods: ['GET','POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  credentials: true,
  maxAge: 3600,
  preflightContinue: true
};

function reqInfo(req) {
  console.log('req.baseUrl', req.baseUrl);
  console.log('req.body', req.body);
  console.log('req.cookies', req.cookies);
  console.log('req.fresh', req.fresh);
  console.log('req.hostname', req.hostname);
  console.log('req.ip', req.ip);
  console.log('req.method', req.method);
  console.log('req.originalUrl', req.originalUrl);
  console.log('req.params', req.params);
  console.log('req.path', req.path);

  console.log('req.accepts([\'json\',\'text\'])=>',req.accepts('application/json'));
  console.log('req.acceptsCharsets(\'UTF-8\')=>',req.acceptsCharsets('UTF-8'));
  //console.log('req.get(\'Content-Type\')=>', req.get('content-type')); // Only when PUT,POST
  console.log('req.get(\'Origin\')=>', req.get('Origin'));
}
//, cors(corsOpts)
router.options('/saksbehandler', cors(corsOptions), function (req, res, next) {
  console.log('\nOPTIONS/saksbehandler');
  reqInfo(req);
  next();
});
router.get('/saksbehandler', cors(corsOptions), function (req, res) {
  console.log('\nGET/saksbehandler');
  reqInfo(req);
  try {
    const saksbehandlere =  JSON.parse(fs.readFileSync("./scripts/mock_data/saksbehandler.json", "utf8"));
    // return a random sakbehandler from list of sakbehandlere
    return res.json(_.sample(saksbehandlere));
  } catch (err) {
    console.log(err)
  }
});


app.use('/api', router);
app.use('/melosys/api', router);
