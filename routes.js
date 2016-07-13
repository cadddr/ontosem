var request = require('request');
var utils = require('./utils.js');
var log = utils.richLogging;
var tmrFormatter = require('./tmr.js').format;
var intermediateFormatter = require('./intermediate.js').format;

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

		var inputData = req.body.inputData;
		if (inputData == "")
			inputData = utils.readInputFile();

		var formattedData = intermediateFormatter(inputData);

		var results = [];

		for (var index in formattedData) {
			var entry = formattedData[index].TMRList;
			for (var stepIndex in entry) {
				var sentenceId = entry[stepIndex]["sent-num"];
				var sentence = entry[stepIndex].sentence;

				for (var tmrIndex in entry[stepIndex].results) {
					var TMR = entry[stepIndex].results[tmrIndex].TMR
					if (TMR) {
						var formattedResult = tmrFormatter({
							"sentenceId": sentenceId,
							"sentence": sentence,
							"tmrIndex": tmrIndex,
							"tmr": TMR
						});
						results.push(formattedResult);
					}
				}
			}
		}

		res.render("multitmr", {
			pageTitle: 'page-tmr',
			debugging: false,
			results: results,
			data: JSON.stringify(results),
			clientscripts: ['client.js'],
			debugStuff: formattedData
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
	}
};
