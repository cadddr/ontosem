var utils = require('./utils.js');
var log = utils.richLogging;

var express = require('express');
var request = require('request');
var app = express();
var adaro = require('adaro');
var routes = require('./routes.js');
var bodyParser = require('body-parser');

app.use(express.static('public'));
app.use(bodyParser());
app.engine('dust', adaro.dust({cache: false, helpers: ['dustjs-helpers']}));
app.set('view engine', 'dust');


// Endpoint for TMR JSON data
app.post('/tmr', routes.tmr);

// Endpoint for intermediate logging analysis
app.post('/intermediate', routes.intermediate);

// Index/data upload page
app.get('/', routes.index);


var PORT = utils.port;
app.listen(PORT);
log.success("Server started on port " + PORT);