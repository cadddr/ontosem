var utils = require('./utils.js');
var log = utils.richLogging;

// The set of attributes which exclusively connects entities to other entities
var relations = new Set(Object.keys(utils.inverseMap));
var debugKeys = new Set(["is-in-subtree","syn-roles","lex-source","concept", "word-ky"]);

function generateColor(colorCounter, colorMax) {
	// TODO: This needs to return distinct (not random) colors!
	// One solution would be to just pick out a bunch of nice colors
	// and make a map from ID : Color, but be sure to account for
	// many many ID's needing colors!
	h = 360 * (colorCounter/colorMax);
	return "hsla("+h+", 80%, 50%, 0.3)";
};

function insertLinebreaks(s) {
	return s.toString().split(",").join("\n");
};

module.exports = {
	format: function(data) {
		log.info('data:');
		log.info(data);
		// Passed a raw JSON TMR, returns a formatted and annotated
		// JSON object to render the decorated TMR to the browser

		var o = [];
		var tmrSet = data.sorted;

		// split the sentence into its individual tokens
		var words = data.sentenceString.split(" ").map(function(token) {
			return {"_token": token};
		});

		log.attn("Interpreting TMR...");

		var colors = {};
		var colorCounter = 0;
		var colorMax = tmrSet.length;

		for (var tmrIndex in tmrSet) {
			var p = {};
			var frame = tmrSet[tmrIndex];
			var frameName = frame["word-key"];

			p._key = frameName;
			p.attrs = [];
			p.optional = [];
			p.debugging = [];

			colors[frameName] = generateColor(colorCounter, colorMax);
			p.color = colors[frameName];
			++colorCounter;


			Object.keys(frame).forEach(function(attrKey) {
				var attrVal = frame[attrKey];
				var identifier = false;

				// Some attribute values come as objects which only contain a single value
				// Simply check and extract the contained string if attrVal is not a string
				if (relations.has(attrKey)) {
					if ( !(typeof attrVal === 'string') && !(attrVal instanceof String))
						attrVal = attrVal.value;
					identifier = attrVal;
				}

				// push entries into appropriate array, based on capitalization/debug
				var entry = {"key": attrKey, "val": insertLinebreaks(attrVal)};
				if (identifier != false)
					entry.identifier = identifier;

				if (utils.isCapitalized(attrKey)) {
					p.attrs.push(entry);
				} else if (debugKeys.has(attrKey)) {
					p.debugging.push(entry);
				} else {
					p.optional.push(entry);
				}

				// associate token with entity identifier (name) and color
				if (attrKey == "word-ind" && !words[attrVal].hasOwnProperty("_name")) {
					words[attrVal]._name = p._key;
				}
			});

			o.push(p);
		}


		var tmpsort = [];

		o.forEach(function(entity) {
			entity.debugging.forEach(function(dbg) {
				if (dbg.key == 'is-in-subtree' && dbg.val == 'EVENT') {
					tmpsort.push(entity);
					entity.attrs.forEach(function(attr) {
						if (eventrelated.has(attr.key))
							o.forEach(function(linkedEntity) {
								if (linkedEntity._key == attr.val) {
									tmpsort.push(linkedEntity);
									o.splice(o.indexOf(linkedEntity), 1);
								}
							});
					});
					o.splice(o.indexOf(entity), 1);
				}
			});
		});

		o = tmpsort.concat(o);

		// Log the entire set of TMR frames
		log.info(o);
		log.info(data);

		// Return the annotated set along with the collection of
		// known entities, as well as the sentence itself.
		return {
			sentenceId: data.sentenceId,
			sentence: words,
			tmrs: o,
			colors: colors
		};
	}
};
