var request = require('request');
var utils = require('./utils.js');
var pug = require('pug');
var log = utils.richLogging;
var tmrFormatter = require('./tmr.js');
var intermediateFormatter = require('./intermediate.js').format;
var lastResults = null;
var tmrData = []

var isEvent = function(word) {
	if(word["is-in-subtree"] != undefined
			&& word["is-in-subtree"] == "EVENTS"){
		return true;
	}
	return false;
};

var eventsFirst = function(sentenceTmr) {
	var results = [];

	// For each word in a sentence
	for (var wordKey in sentenceTmr) {
		var wordTmr = sentenceTmr[wordKey];
		wordTmr["word-key"] = wordKey;

		// If the word is an event
		if (isEvent(wordTmr)) {
			// Prepend it to our results
			results.unshift(wordTmr);
		} else {
			// Append it to our results
			results.push(wordTmr);
		}
	}

	// Results should have all events, in no particular order,
	// in front of all non-events, in no particular order
	return results;
};

// Think about input
// Split multiple TMR possibilities
//
// Lowercase anything with a lowercase except concept and is-in-subtree
// Handle weird list behavior
// Fix minimization
// Fix highlighting

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
			data: JSON.stringify(results),
			clientscripts: ['client.js'],
			debugStuff: formattedData
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
	listen: function(req, res) {
		log.info("Serving listener page")
		var hostURL = req.headers.host
		
		res.render("listener", {
			pageTitle: 'page-tmr',
			data: hostURL,
			clientscripts: ['waiting.js', 'client.js']
		})
	},
	getResults: function(req, res) {
		if (tmrData.length > 0)
			res.send('TMR')
		else
			res.send('none')
	},
	tmrData: function(req, res) {
		log.info("Receiving results from analyzer")
		tmrData.push(req.body.inputData)
		res.send('success')
	}
};
