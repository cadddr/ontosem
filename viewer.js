var utils = require('./utils.js');
var log = utils.richLogging;
var template = require('./templateengine.js');

var express = require('express');
var app = express();
var adaro = require('adaro');
var routes = require('./routes.js');

app.engine('dust', adaro.dust({}));
app.set('view engine', 'dust');



app.get('/', routes.index);


var PORT = utils.port;
app.listen(PORT);
log.success("Server started on port " + PORT);