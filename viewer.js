var utils = require('./utils.js');
var log = utils.richLogging;

var express = require('express');
var request = require('request');
var app = express();
var adaro = require('adaro');
var routes = require('./routes.js');
var bodyParser = require('body-parser');

app.use(express.static('public'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.set('views', './views');
app.set('view engine', 'pug');


// Endpoint for TMR JSON data
app.post('/tmr', routes.tmr);
app.post('/tmrData', routes.tmrData);

// Endpoint for intermediate logging analysis
app.post('/logs', routes.intermediate);

// Index/data upload page
app.get('/', routes.index);
app.get('/tmr', routes.index);
app.get('/logs', routes.index);
app.get('/listen', routes.listen);
app.get('/getResults', routes.getResults)


var PORT = utils.port;
app.listen(PORT);
log.success("Server started on port " + PORT);
