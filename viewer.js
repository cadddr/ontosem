var utils = require('./utils.js');
var log = utils.richLogging;

var express = require('express');
var app = express();
var adaro = require('adaro');
var routes = require('./routes.js');

app.use(express.static('public'));
app.engine('dust', adaro.dust({cache: false}));
app.set('view engine', 'dust');


app.get('/example', routes.example);
app.get('/', routes.index);


var PORT = utils.port;
app.listen(PORT);
log.success("Server started on port " + PORT);