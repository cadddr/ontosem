var utils = require('./utils.js');
var log = utils.richLogging;

var express = require('express');
var app = express();
var adaro = require('adaro');
var routes = require('./routes.js');
var bodyParser = require('body-parser');

app.use(express.static('public'));
app.use(bodyParser());
app.engine('dust', adaro.dust({cache: false, helpers: ['dustjs-helpers']}));
app.set('view engine', 'dust');


app.get('/intermediate', routes.intermediate);
app.post('/tmr', routes.tmr);
app.get('/upload', routes.upload);
app.get('/', routes.index);


var PORT = utils.port;
app.listen(PORT);
log.success("Server started on port " + PORT);