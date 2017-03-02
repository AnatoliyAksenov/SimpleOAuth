'use strict';

var express = require("express");
var http = require("http");
var https = require("https");
var fs = require("fs");
var crypto = require("crypto");

var flat = require('node-flat-db');
var storage = require('node-flat-db/file-sync');
var db = flat('db.json', { storage: storage });

var uuid = require("uuid");

var privateKeyFile = process.env.PRIVATE_KEY_FILE;
var certificateFile = process.env.CERTIFICATE_FILE;

var privateKey  = fs.readFileSync(privateKeyFile, 'utf8');
var certificate = fs.readFileSync(certificateFile, 'utf8');

var credentials = {key: privateKey, cert: certificate};

var helmet = require('helmet');

// Create a new Express application.
var app = express();

/**
 * OAuth Server port configuration.
 */
var port = process.env.port || 8080;
var https_port = process.env.HTTPS_PORT || 443;

var address = process.env.address || '0.0.0.0';
var use_https = process.env.enable_https || process.env.ENABLE_HTTPS;

app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('body-parser').json());
app.use(require('express-session')({ 
  secret: 'RosEuroBank developers the best!', 
  resave: true, 
  saveUninitialized: true,
  name : 'sessionId'
}));

//Security
app.use(helmet());
app.disable('x-powered-by');

app.use('/login', express.static(__dirname + '/app'));
app.use('/admin', express.static(__dirname + '/admin/app'))

app.post('/api/user/add', function(req, res){
  var phonenumber = req.body.phonenumber;
  var password = req.body.password;
  console.log(`${password}`);
  console.log("%j", req.body);

  var uid = uuid();
  var hash = crypto.createHash('sha256').update(password).digest('base64');
  db("users").push({uid: uid, phone: phonenumber, pwdHash: hash});
  res.status(200).send(uid);
});

app.get('/api/users', function(req, res){
  res.status(200).json(db("users"));  
});

app.post('/api/account/add', function(req, res){
  var account = req.body.account;
  var secret = req.body.secret;
  var redirect = encodeURIComponent(req.body.redirect);
  var uid = uuid();
  
  db('accounts').push({uid: uid, account: account, secret: secret, redirect: redirect});
  res.status(200).send(uid);
});

app.get('/api/accounts', function(req, res){
  res.status(200).json(db("accounts"));
});

app.get('/oauth/account=:account&secret=:secret', function(req, res){
    var account = req.params.account;
    var secret = req.params.secret;
    var redirect;
    
    var recipient = db('accounts').find({account: account});
    if (recipient){

      var redirect = recipient.redirect;

      req.session.account = account;
      req.session.secret = secret;
      req.session.redirect = redirect;

      res.redirect('/login');
      return;
    }
    res.status(404).send('Recipient not found.');
});

app.post('/authentication', function(req, res){
    var phonenumber = req.body.phonenumber;
    var password = req.body.password;
    var authentication = false;
    var code = null;

    if( phonenumber != void 0 && password != void 0 )
    {
      var user = db('users').find({phone: phonenumber});
      
      authentication = user.pwdHash == crypto.createHash('sha256').update(password).digest('base64');
      code = Math.random() * 1000;
      req.session.authentication = authentication;
      if (authentication){
        var link = decodeURIComponent(req.session.redirect);
        res.redirect(`${link}&code=${code}`);
        return;
      }
    }

    if(!req.session.iteration){
      req.session.iteration = 0;
    }
    console.log(`iteration ${req.session.iteration}`);

    if (req.session.iteration > 2)
    {
      var link = decodeURIComponent(req.session.redirect);
      res.redirect(`${link}&error=${encodeURIComponent('Authentication error: the number of login attempts over.')}`);
      return;
    }
        
    req.session.iteration += 1;
    req.session.auth_error = "Authentication error: user or password incorrect.";
    res.redirect('/login');       
});

app.all('/logoff', function(req, res){
    delete req.session.account;
    delete req.session.secret;
    delete req.session.redirect;
    delete req.session.authentication;
});

app.get('/', function(req, res){
  res.status(200).send('This is a OAuth 2.0 authentication server.');
});

app.get('/teapot',
  function(req,res){
    res.sendStatus(418);
});

app.use(function(req, res){
 res.sendStatus(404);
});

// HTTP server
var http_app = new express();
http_app.all('*', function(req, res){
  console.log('Request using http protocol');
  res.status(400).send('Use HTTPS protocol instead HTTP.');  
});
var server = http.createServer(http_app);
//var server = http.createServer(app);

server.listen(port, function () {
  console.log('HTTP server listening on port ' + port);
});

// HTTPS server
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(https_port, function(){
	console.log('HTTPS server listening on port ' + https_port );
});