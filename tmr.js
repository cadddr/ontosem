var utils = require('./utils.js');
var log = utils.richLogging;

// The set of attributes which exclusively connects entities to other entities
var relations = new Set(Object.keys(utils.inverseMap));
var debugKeys = new Set(["is-in-subtree","syn-roles","lex-source","concept", "word-ky"]);

function sortFrames(frames) {
	var sortedFrames = [];
	for (var i = frames.length; i >= 0; --i) {
		for (var child in frames[i].insertAfter)
			;
	}
	return sortedFrames;
}

function generateColor(colorCounter, colorMax) {
	// Returns distinct colors by changing hue
	var h = Math.floor( 360 * colorCounter/colorMax );
	var s = "80%";
	var l = "50%";
	var a = "0.3";
	return "hsla("+[h,s,l,a].join(',')+")";
};

function insertLinebreaks(s) {
	return s.toString().split(",").join("\n");
};

module.exports = {
	format: function(data) {
//		log.info('data:');
//		log.info(data);
		// Passed a raw JSON TMR, returns a formatted and annotated
		// JSON object to render the decorated TMR to the browser

		var sentenceId = data.sentenceId;
		var splitSentence = data.sentence.split(" ").map(function(token) {
			return {"_token": token};
		});
		var tmrIndex = data.tmrIndex;
		var tmr = data.tmr;

		log.attn("Interpreting TMR...");

		var frames = [];
		var entitySet = new Set(Object.keys(tmr));

		var color = {};
		var colorCounter = 0;
		var colorMax = entitySet.size;
		for (var entityName in tmr) {
			color[entityName] = generateColor(colorCounter, colorMax);
			++colorCounter;
		}

		for (var entityName in tmr) {
			var entityData = tmr[entityName];
			var isEvent = (entityData["is-in-subtree"] == "EVENT");
			var required = [];
			var optional = [];
			var debug = [];
			var insertAfter = [];


			for (var attrKey in entityData) {
				var attrVal = entityData[attrKey];

				// Some attribute values come as objects which only contain a single value
				// Simply check and extract the contained string if attrVal is not a string
				if (relations.has(attrKey)) {
					if ( !(typeof attrVal === 'string') && !(attrVal instanceof String))
						attrVal = attrVal.value;
					if (isEvent)
						insertAfter.push(attrVal);
				}

				var attr = {"_key": attrKey, "_val": insertLinebreaks(attrVal)};

				if (entitySet.has(attrVal))
					attr._color = color[attrVal];

				// associate token with entity identifier (name) and color
				if (attrKey == "word-ind")
					splitSentence[attrVal]._color = color[entityName];

				// push entries into appropriate array, based on capitalization/debug
				if (utils.isCapitalized(attrKey))
					required.push(attr);
				else if (debugKeys.has(attrKey))
					debug.push(attr);
				else
					optional.push(attr);
			}

			frames.push({
				"_key": entityName,
				"_color": color[entityName],
				"attributes": {
					"required": required,
					"optional": optional,
					"debug": debug
				},
				"insertAfter": insertAfter
			});
		}

		// Sort the frames such that events come first

		// Return the annotated set along with the collection of
		// known entities, as well as the sentence itself.
		return {
			"_sentenceId": sentenceId,
			"splitSentence": splitSentence,
			"_tmrIndex": tmrIndex,
			"frames": frames
		};
	}
};
