var request = require('request');
var utils = require('./utils.js');
var pug = require('pug');
var log = utils.richLogging;
var tmrFormatter = require('./tmr.js');
var intermediateFormatter = require('./intermediate.js').format;
var lastResults = null;
var tmrData = []
var intermediateData = []

module.exports = {
	index: function(req, res) {
		// Homepage
		log.info("Serving INDEX");
		res.render("index", {
			debugging: false
		});
	},
	tmr: function(req, res) {
		// Multiple TMR viewer
		log.info("Received SENTENCE");

		// read the TMR data from the request body or the input file
		var inputData = req.body.inputData;
		if (inputData == "")
			inputData = utils.readInputFile();
		
		// parse and format the TMR data
		var formattedData = intermediateFormatter(inputData);
		var results = tmrFormatter.formatTMRList(formattedData);
		
		// otherwise, render the multiTMR file normally
		res.render("multitmr", {
			pageTitle: 'page-tmr',
			debugging: false,
			results: results,
			clientscripts: ['client.js']
		});
	},
	subtmr: function(req, res) {
		// read the TMR data from the oldest TMR that has been sent from the analyzer
		var inputData = tmrData.shift();
		
		// parse and format the TMR data
		var formattedData = intermediateFormatter(inputData);
		var results = tmrFormatter.formatTMRList(formattedData);
		
		// this request is being made by the listener page so render the subTMR file
		var tmrHTML = pug.renderFile('views/subtmr.pug', {results:results});
		res.send({
			tmrHTML: tmrHTML,
			data: JSON.stringify(results)
		});
	},
	intermediate: function(req, res) {
		// intermediate results viewer
		log.info("Serving INTERMEDIATE")
		
		var raw = utils.readInputFile()
		if (req.body.inputData.length > 0)
			raw = req.body.inputData.replace(/\\n/g, '')
		var results = intermediateFormatter(raw)
		
		res.render("intermediate", {
			pageTitle: 'page-intermediate',
			parseResults: results,
			data: JSON.stringify(results),
			clientscripts: ['intermediateclient.js', 'client.js', 'prism.js'],
			clientStyles: ['prism.css']
		})
	},
	subintermediate: function(req, res) {
		// get the sentence index from the request
		var sentenceIndex = req.body.sentenceIndex;
		
		// read the intermediate data from the oldest intermediate that has been sent from the analyzer
		var inputData = intermediateData.shift();
		
		// parse and format the intermediate data
		var results = intermediateFormatter(inputData);
		
		// this request is being made by the listener page so render the subintermediate file
		var intermediateHTML = pug.renderFile('views/subintermediate.pug', {results:results[0], sentenceIndex:sentenceIndex});
		res.send({
			intermediateHTML: intermediateHTML,
			data: JSON.stringify(results)
		});
	},
	listenTMR: function(req, res) {
		log.info("Serving TMR listener page")
		var hostURL = req.headers.host
		
		res.render("TMRListener", {
			pageTitle: 'page-tmr',
			data: hostURL,
			clientscripts: ['waiting.js', 'client.js']
		})
	},
	listenIntermediate: function(req, res) {
		log.info("Serving intermediate results listener page")
		
		res.render("IntermediateListener", {
			pageTitle: 'page-intermediate',
			data: [],
			clientscripts: ['waiting.js', 'intermediateclient.js', 'client.js'],
			clientStyles: ['prism.css']
		})
	},
	getTMRResults: function(req, res) {
		if (tmrData.length > 0)
			res.send('TMR')
		else
			res.send('none')
	},
	getIntermediateResults: function(req, res) {
		if (intermediateData.length > 0)
			res.send('intermediate')
		else
			res.send('none')
	},
	tmrData: function(req, res) {
		log.info("Receiving tmr results from analyzer")
		tmrData.push(req.body.inputData)
		res.send('success')
	},
	intermediateData: function(req, res) {
		log.info("Receiving intermediate results from analyzer")
		intermediateData.push(req.body.inputData)
		res.send('success')
	}
};
