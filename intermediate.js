var utils = require('./utils.js');
var log = utils.richLogging;

var regex = {
	'sentence': /(\s*Input Sentence = )(.*)/,
	'trimWord': /^(([A-Z]*-?)+)(-[A-Z]+[0-9]+)?$/,
	'wordLexIndex': /^.*-[A-Z]*([0-9]+)$/,
	'dependency': /^\s*====> Processing dependency: \[ (\S*) , ([0-9]*) (\S*) , ([0-9]*) (\S*) \]/,
	'headSense': /^\s*-->> Head_sense= (.*)/,
	'wordSense': /^\s*-->> Word_sense= (.*)/,
	'word': /^\s*Word = (\S+)/,
	'senses': /^\s*Word = (\S+) is found in Lexicon, number of senses = ([0-9]*)/,
	'synonyms': /^\s*Word = (\S+) is found in ([0-9]*) sense\(s\) as a synonym./,
//	'finalResult': /^\s*\-\- Final result\: Length\=\s*([0-9]*)/,
	
	'success': /^\s*Successful match (\S+)( and (\S+))?/,
	'skip': /^\s*Skipping  (\S+)( - (\S+) pair.)?/,
	'falsePositive': /^\s*Removing a false positive result: (\{([0-9]*\: \'(\S+)\',? ?)*})/,
	'formatFalsePositive': /\{|\}|\s*[0-9]*\: |'/g,
	'missingRole': /^\s*Sense (\S+) : required syntactic role \( (\S+) \) is missing in the input sentence/,
	'constraint': /^\s*Semantic constraint  (\S+|\[[^\]]*\])  for (\S+) in (\S+)  had failed\./,
	'requiredWords': /^\s*Required word\(s\)  (\S+|\[[^\]]*\])  does NOT match input  (\S+)/,
	
	'shortTermMemory': /^--- Short Term Memory after processing the last dependency\. Length= ([0-9]*)/,
	'finalResult': /^-- Final result: Length= ([0-9]*)/,
	'lexStorage': /^--- lex entries storage:/,
	'lexEntry': /^\s*word_index= ([0-9]*) word_sense\(s\)= dict_keys\((\[[^\]]*\])\)/,
	'formatLexEntry': /[\[\]\' ]/g,
	'formatTMR': /((\{|,)\s*)([0-9]+)(\:\s*)/g,
	'formatTMRSubstitution': '$1\"$3\"$4',
	'cleanTMR': /(OrderedDict\(\[[^\]]*\]\))/g,
	'tokenizeSentence': /\b(\S+)\b/g,
	//'cleanTMRSubstitution': '\'$1\'',
	
	'unknownElement': /^\s*(\S+) has Unknown element "([^"]*)".Skipping it\./,
	'wordSenseSelected': /^\s*Word (\S+) , index= ([0-9]*) has been used with sense= (\S+)/,
	'localLexEntry': /^\s*Word = (\S+) lex entry is stored locally, number of senses = ([0-9]*)/,
	'lexEntryNotFound': /^\s*input syn element (\S+)  not found in lex entry (\S+)/
}

function getWordObject (wordParam, lexMappings, tokenIndex) {
	var word = wordParam.split('-')[0];
//	log.info('getWordObject (' + wordParam + ', ..., ' + tokenIndex + ')');
//	log.info(lexMappings);
//	log.info(wordParam);
	if (wordParam.match(regex.trimWord))
		word = wordParam.match(regex.trimWord)[1];
	
	if (lexMappings[tokenIndex].wordString == undefined)
		lexMappings[tokenIndex].wordString = word;	
	return lexMappings[tokenIndex];
	/*
	if (lexMappings[tokenIndex].wordString)
		return lexMappings[tokenIndex];
	else
		return (lexMappings[tokenIndex] = {
			'wordString': word,
			'events': [],
			'groupedEvents': []
		});*/
}

function trimWord (word) {
	return word.match(regex.trimWord)[1];
}

function getLexIndex (wordString) {
	var match = wordString.match(regex.wordLexIndex);
	var index = 0;
	if (match)
		index = match[1];
//	log.info('getLexIndex(' + wordString + ') = ' + index);
	return parseInt(index);
}

function getWordIndex (wordString, words) {
	for (var w in words)
		if (words[w] == wordString)
			return w;
	words.push(wordString);
	return words.length - 1;
//			var index = Object.keys(words).indexOf(wordKey);
//			//log.info('getWordIndex(' + wordString + ') = ' + index);
//			return parseInt(index);
//		}
/*	for (var i = 0; i < words.length; i++)
		if (words[i].wordString == wordString) {
			log.info('getWordIndex(' + wordString + ') = ' + i);
			return i;
		}*/
//	log.info('getWordIndex(' + wordString + ') = ' + (-1));
}

function getWordIdData (wordString, lexMappings, words, tokenIndex) {
	var wordIndex = getWordIndex(trimWord(wordString), words);
	var lexIndex = getLexIndex(wordString);
	if (lexIndex == -1)
		lexIndex = 0;
	//log.info(' > getWordId(' + wordString + ') = ' + (wordIndex + '.' + lexIndex));
	//log.info(words);
	//return 'L' + wordIndex + '.' + lexIndex;
	var id = wordIndex + '.' + lexIndex;
	if (tokenIndex != -1)
		id = tokenIndex + ':' + id;
	return {
		'tokenIndex': tokenIndex,
		'wordIndex': wordIndex,
		'lexIndex': lexIndex,
		'id': id,
		'sortId': [parseInt(tokenIndex), parseInt(wordIndex), parseInt(lexIndex)]
	}
}

function createEvent (parsedLine, status, state, lexMappings, words, events) {
//	log.info('createEvent');
//	log.info(parsedLine);
//	log.info(status);
//	log.info(state);
//	log.info(words);
	
	var event = {
		'reasons': state.reasons,
		'status': status,
		'nullified': false,
//		'wordObjects': []
	};
	
	state.reasons = [];
	
	if (status == 'match')
		event.reasons = [];
	
	if (status == 'match' || status == 'skip')
		makePair(parsedLine[1], parsedLine[3]);
	
	/*
	if (status == 'missingRole')
		makePair(parsedLine[1], parsedLine[3]);
	*/
	
	return event;
	
	function makePair (wordA, wordB) {
		log.info('makePair(' + wordA + ', ' + wordB + ')');
		log.info(state.dependency);
		
		if (state.headSense != state.word)
			wordA = state.headSense;
		
		if (wordB) {
			event.type = 'pair';
			event.words = [wordA, wordB];
		} else {
			event.type = 'single';
			event.words = [wordA];
		}
		
		
		//event.id = 'E' + getWordId(wordA, words);
//		event.wordObjects.push(wordObjA);
//		log.info(wordObjA);

//		var wordObjA = getWordObject(wordA, words);
//		wordObjA.events.push(event);
//		var idData = getWordIdData(wordA, words);
		var indexA = state.dependency.words[0].index;
		var wordObjA = getWordObject(wordA, lexMappings, indexA);
		var idData = getWordIdData(wordA, lexMappings, words, indexA);
		event.id = idData.id;
		event.sortId = idData.sortId; //[idData.wordIndex, idData.lexIndex];
		
		if (wordB) {
//			var wordObjB = getWordObject(wordB, words);
//			wordObjB.events.push(event);
//			idData = getWordIdData(wordB, words);

			var indexB = state.dependency.words[1].index;
			var wordObjB = getWordObject(wordB, lexMappings, indexB);
			idData = getWordIdData(wordB, lexMappings, words, indexB);
			event.id += '-' + idData.id;
			event.sortId = event.sortId.concat(idData.sortId);//[idData.wordIndex, idData.lexIndex]);
//			wordObjB.events.push(event);
//			log.info('                       pushing event: ' + event.id + ' to events list for ' + wordObjB.index);
		}
		log.info('                       pushing event: ' + event.id + ' to events list for ' + wordObjA.index);
		wordObjA.events.push(event);
		
		if (status == 'skip') {
			nullifyOldEvents(event, wordA, events);
		}
	}
//			event.wordObjects.push(wordObjB);
//			log.info(wordObjB);
	
	function nullifyOldEvents (event, word, events) {
		//var word = event.words[0];
//		log.info('---nullifyOldEvents---');
//		log.info('event = ');
//		log.info(event);
//		log.info('word = ');
//		log.info(word);
//		log.info(word.events);
		for (var i = 0; i < events.length; ++i) {
			var otherEvent = events[i];
			var otherWord = trimWord(otherEvent.words[0]);
			if (otherEvent.status == 'match' && otherEvent.words[0] == word) {
			//if (otherEvent.status == 'match') {
//				log.info(' @@@@@@@@@@@@@@@@@@@@@@@@@@@@ EVENT SHOULD BE NULIFIED @@@@@@@@@@@@@@@@@@@@@@@@@@@@ ');
//				log.info(otherEvent);
//				log.info(otherEvent.words[0] + ' == ' + word);
				otherEvent.nullified = 'nullified';
				event.nullifies = otherEvent.id;
			}
		}
//		log.info('----------------------');
	}
}

module.exports = {
	format: function(raw) {
		console.log('*************************************************************************************************************');
		console.log('*************************************************************************************************************');
		console.log('*************************************************************************************************************');
		console.log('*************************************************************************************************************');
		console.log('*************************************************************************************************************');
		console.log('*************************************************************************************************************');
		console.log('*************************************************************************************************************');
		console.log('*************************************************************************************************************');
		console.log('*************************************************************************************************************');
		console.log('*************************************************************************************************************');
		console.log('*************************************************************************************************************');
		
		// initialize variables before parsing
		var lines = raw.split('\n');
		var headerLines = [];
		var bodyLines = [];
		var readingHeader = true;
		var words = [];
		var events = [];
		var lexMappings = [];
		//var word = "";
		var sentence = "Nothing...";
		var tokens = [];
		var TMRList = [];
		var rawIndex = 0;
		var state = {
			'dependency': {},
			'word': '',
			'headSense': '',
			'wordSense': '',
			'reasons': [],
			'tmrContents': '',
			'parsingTmr': false
		}
		var labels = {
			'match': 'Lexical Match',
			'success': 'Success',
			'skip': 'Skipped',
			'falsePositive': 'False Positive'
		};
		
		var onlyTMR = false;
		if (lines[0][0] != '>') {
			onlyTMR = true;
			readingHeader = false;
		}
		
		// parse the whole output
		console.log('LINES:');
		console.log(lines);
		console.log('*************************************************************************************************************');
		for (var i = 0; i < lines.length; i++) {
			//console.log('i = ' + i);
			var line = lines[i];
			if (readingHeader)
				console.log(rawIndex + ':\t' + line);
			rawIndex += line.length + 1;
			
			// header parsing
			// check if this is the end of the header
			if ( readingHeader && !(line.substring(0,3) === '>>>' || line[0] === '\t' || line[0] === ' ') ) {
				readingHeader = false;
				console.log('DONE READING HEADER');
			}
			
			// if we are reading the header parse this line as a header line
			if (readingHeader) {
				headerLines.push(line);
				var sentenceParse = line.match(regex.sentence);
				if (sentenceParse) {
					sentence = sentenceParse[2];
					tokens = sentence.match(regex.tokenizeSentence);
					
					for (var t in tokens) {
						var token = tokens[t];
						lexMappings.push({
							'index': t,
							'token': token,
							'events': [],
							'groupedEvents': []
						});
					}
				}
			
			// otherwise parse it as a body line
			} else {
				bodyLines.push(line);
				
				var parsedLine;
				
				
				
				if (state.parsingTmr && (line.substring(0,3) != '---')) {
					state.tmrContents += line;
	//				console.log('SKIPPING TMR LINE:	' + line);
				} else {
					
					// parse this TMR line
					if (state.parsingTmr)
						parseTMRContents(state, TMRList, sentence);
					
					// skip empty lines
					if (line[0] === '\n' || line[0] === '\r') {
	//					console.log('empty	' + line);
	
					// dependency parsing
					} else if (parsedLine = line.match(regex.dependency)) {
//						console.log('dependency	' + line);
						state.dependency = {
							'type': parsedLine[1],
							'words': [ { 'index': parsedLine[2], 'token': parsedLine[3] }, { 'index': parsedLine[4], 'token': parsedLine[5] } ]
						};
//						console.log(' !!!!!!!!!!!!!!!!!!!!!!!! DEPENDENCY SET TO 	' + state.dependency);
					
					// head sense parsing
					} else if (parsedLine = line.match(regex.headSense)) {
//						console.log('headSense	' + line);
						state.headSense = parsedLine[1];
						
					// word sense parsing
					} else if (parsedLine = line.match(regex.wordSense)) {
//						console.log('wordSense	' + line);
						state.wordSense = parsedLine[1];
						
					// senses parsing
					} else if (parsedLine = line.match(regex.senses)) {
//						console.log('senses	"' + line + '"');
						state.word = parsedLine[1];
						var index = state.dependency.words[0].index;
						getWordObject(state.word, lexMappings, index);
						//words[state.word]['senses'] = parseInt(parsedLine[2]);
						
					// synonym parsing
					} else if (parsedLine = line.match(regex.synonyms)) {
//						console.log('synonym	' + line);
						state.word = parsedLine[1];
						var index = state.dependency.words[0].index;
						getWordObject(state.word, lexMappings, index);
						//words[state.word]['synonyms'] = parseInt(parsedLine[2]);
						
						
					// success parsing
					} else if (parsedLine = line.match(regex.success)) {
//						console.log('success	' + line);
						var event = createEvent(parsedLine, 'match', state, lexMappings, words, events);
						events.push(event);
						//getWordObject(state.word, words).events.push(event);
						//word = parsedLine[1];
						//getWordObject(word, words);
						
					// skip parsing
					} else if (parsedLine = line.match(regex.skip)) {
//						console.log('skip	' + line);
						var event = createEvent(parsedLine, 'skip', state, lexMappings, words, events);
						events.push(event);
//						getWordObject(state.word, words).events.push(event);
						
					// falsePositive parsing
					} else if (parsedLine = line.match(regex.falsePositive)) {
//						console.log('falsePositive	' + line);
		//				createEvent(parsedLine, 'falsePositive', state);
						state.reasons.push(line);
						
					// missingRole parsing
					} else if (parsedLine = line.match(regex.missingRole)) {
//						console.log('missingRole	' + line);
		//				createEvent(parsedLine, 'missingRole', state);
						state.reasons.push(line);
						
					// constraint parsing
					} else if (parsedLine = line.match(regex.constraint)) {
//						console.log('constraint	' + line);
		//				createEvent(parsedLine, 'constraint', state);
						state.reasons.push(line);
						
					// requiredWords parsing
					} else if (parsedLine = line.match(regex.requiredWords)) {
//						console.log('requiredWords	' + line);
		//				createEvent(parsedLine, 'requiredWords', state);
						state.reasons.push(line);
						
						
					// shortTermMemory parsing
					} else if (parsedLine = line.match(regex.shortTermMemory)) {
//						console.log('shortTermMemory	' + line);
						
					} else if (parsedLine = line.match(regex.finalResult)) {
//						console.log('finalResult	' + line);
						
					// lexStorage parsing
					} else if (parsedLine = line.match(regex.lexStorage)) {
//						console.log('lexStorage	' + line);
						lexMappings.forEach(function (mapping) {
							mapping.senses = [];
						});
						
					// lexEntry parsing
					} else if (parsedLine = line.match(regex.lexEntry)) {
						console.log('lexEntry	' + line);
						var wordIndex = parsedLine[1];
						var senseString = parsedLine[2].replace(regex.formatLexEntry, '');
						var senseList = senseString.split(',');
						lexMappings[wordIndex].senses = senseList;
						//console.log('wordIndex = ' + wordIndex);
						//console.log('senseList = ' + senseList);
						
					// unknownElement parsing
					} else if (parsedLine = line.match(regex.unknownElement)) {
						state.reasons.push(line);
//						console.log('unknownElement	' + line);
						
					// wordSenseSelected parsing
					} else if (parsedLine = line.match(regex.wordSenseSelected)) {
//						console.log('wordSenseSelected	' + line);
						//var event = createEvent(parsedLine, 'success', state, words);
						//getWordObject(state.word, words).events.push(event);
						
					// localLexEntry parsing
					} else if (parsedLine = line.match(regex.localLexEntry)) {
//						console.log('localLexEntry	' + line);
						
					// lexEntryNotFound parsing
					} else if (parsedLine = line.match(regex.lexEntryNotFound)) {
						state.reasons.push(line);
//						console.log('lexEntryNotFound	' + line);
						
					// tmr parsing
					} else if (line[0] === '{') {
//						console.log('tmr	' + line);
						state.parsingTmr = true;
						state.tmrContents += line;
						
					//  there was a parse error
					} else {
						console.log(' ************** BAD ************** 	' + line);
					}
					
				}
			}
			
		}
		console.log('*************************************************************************************************************/');
//		console.log('events:');
//		console.log(events);
//		console.log('words:');
//		console.log(words);
//		console.log(JSON.stringify(words));
		
		// if the user gave only a TMR, only parse and return that
		if (onlyTMR) {
			parseTMRContents(state, TMRList, sentence);
			return {'TMRList': TMRList};
		}
		
		var wordsList = [];
		for (var w in words) {
			var word = words[w];
			wordsList.push(word);
		}
		
		// build the lexicon entry list
		var lexEntries = {};
		lexMappings.forEach(function (mapping) {
			var index = mapping.index;
			mapping.senses.forEach(function (sense) {
				var trimmedName = trimWord(sense);
				var parent = lexEntries[trimmedName];
				if (parent == null)
					parent = { 'id': getWordIdData(trimmedName, lexMappings, words, index).id };
				lexEntries[trimmedName] = parent;
				
				lexEntries[sense] = {
					'parent': parent.id,
					'id': getWordIdData(sense, lexMappings, words, index).id
				}
			});
			
			mapping.state = 'show';
			if (mapping.senses.length == 0)
				mapping.state = 'hide';
			else if (mapping.senses.length == 1)
				mapping.state = 'hide';
		});
		
		/*
		
		for (var w in wordsList) {
			lexEntries[wordsList[w].wordString] = {'id': w + '.0'};
//			log.info("w = " + w);
//			log.info("wordsList[w] = " + wordsList[w]);
//			log.info("wordsList[w].word = " + wordsList[w].wordString);
		}
//		log.info("wordsList = ");
//		log.info(wordsList);
		log.info("$$$$$$$$$$$$$$$$$$$$$lexEntries = ");
		log.info(lexEntries);
		for (var w in wordsList) {
			var word = wordsList[w];
//			lexEntries[word] = {'id':id+10000};
//			log.info('w = ' + w);
//			log.info('word = ');
//			log.info(word);
			for (var e in word.events) {
				var event = word.events[e];
				for (var entry in event.words) {
					var lexEntry = event.words[entry];
					
					// find the lex mapping
					for (var m in lexMappings) {
						var mapping = lexMappings[m];
						var mappedIndex = mapping.senses.indexOf(lexEntry);
						if (mappedIndex != -1) {
							mapping.events.push(event);
							break;
						}
					}
					
//					log.info("lexEntry = ");
//					log.info(lexEntry);
					if (lexEntries[lexEntry] == null) {
						var trimmedName = lexEntry.match(regex.trimWord)[1];
						var lexIndex = getLexIndex(lexEntry);
						//var entryObject = {'id': entry + '.' + lexIndex, 'parent':lexEntries[trimmedName].id};
						var entryObject = {'id': getWordIdData(lexEntry, words).id, 'parent':lexEntries[trimmedName].id};
						lexEntries[lexEntry] = entryObject;
					}
					//log.info(' > lexEntry = ' + lexEntry);
				}
			}
		}
		*/
			
		log.info('EVENTS: ' + lexMappings[1].events.length);
		log.info(lexMappings[1].events[0]);
		log.info(lexMappings[1].events[1]);
		
		// group similar events together
		groupEvents(lexMappings);
		log.info('EVENTS: ' + lexMappings[1].events.length);
		log.info(lexMappings[1].events[0]);
		log.info(lexMappings[1].events[1]);
		
		log.info('aAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
		log.info(lexEntries);
		
		// annotate the sentence
		//log.info(newTMRString);
		//log.info(TMR);
		var sentenceMappings = {};
		for (var i = 0; i < TMRList[0].results.length; ++i) {
			log.info('i = ');
			log.info(i);
			var frame = TMRList[0].results[i];
			for (var j in frame.TMR) {
				log.info('j = ');
				log.info(j);
				var entry = frame.TMR[j];
//				var index = entry['word-ind'];
//				sentenceMappings[index] = entry['from-sense'].match(regex.trimWord)[1];
				sentenceMappings[entry.token] = entry['from-sense'].match(regex.trimWord)[1];
			}
		}
		for (var m in lexMappings) {
			var mapping = lexMappings[m];
			var tokenIndex = parseInt(mapping.index);
			mapping.token = tokens[tokenIndex];
			mapping.wordString = tokens[tokenIndex].toUpperCase();
		}
		
		//log.info('TMRList = ');
		//log.info(TMRList);
		var data = {'TMRList':TMRList, 'words':wordsList, 'sentence':sentence, 'labels':labels, 'lexEntries':lexEntries, 'lexMappings':lexMappings, 'sentenceMappings':JSON.stringify(sentenceMappings)};
//		log.info("---------------------------------------------------------------------------------------------")
//		log.info("data = ")
//		log.info(data)
//		log.info("wordsList = ")
//		log.info(wordsList)
//		log.info("---------------------------------------------------------------------------------------------")
		return data;
	}
};

// group events together
function groupEvents (lexMappings) {
	log.info(" ############################ ############################ groupEvents ############################  ############################ ")
	log.info('1 - EVENTS: ' + lexMappings[1].events.length)
	//log.info(lexMappings)
	for (var w in lexMappings) {
		var word = lexMappings[w];
//		log.info("word = " + word.wordString);
		for (var e in word.events) {
//			log.info("\te = " + e);
			var event = word.events[e];
			
			// check to see if this event can be added to an existing group
			var addedToGroup = false;
			for (var g in word.groupedEvents) {
//				log.info("\t\tg = " + g);
				var group = word.groupedEvents[g];
//				log.info("\t\tgroup = ");
//				log.info(group);
//				log.info("\t\tword.groupedEvents = ");
//				log.info(word.groupedEvents);
				if (eventsMatch(group.events[0], event)) {
					group.events.push(event);
					group.ids.push(event.id);
					group.multi = true;
					addedToGroup = true;
				}
			}
			
			// it doesn't fit in any existing group, so create a new one
			if (!addedToGroup) {
				word.groupedEvents.push({
					'multi': false,
					'events': [event],
					'ids': [event.id],
					'status': event.status,
					'type': event.type,
					'reasons': event.reasons,
					'nullified': event.nullified
				});
				log.info('adding event ' + event.id);
				
			}
		}
//		log.info("word = ")
//		log.info(word)
//		log.info("word.groupedEvents = ")
//		log.info(word.groupedEvents)
		
		// sort the events in each group
		word.groupedEvents.forEach(function (group) {
			group.events.sort(function (a, b) {
				for (var i = 0; i < Math.min(a.sortId.length, b.sortId.length); ++i) {
					var compareResult = compareValues(a.sortId[i], b.sortId[i]);
					if (compareResult != 0)
						return compareResult;
				}
				return compareValues(a.length, b.length);
			});
		});
		function compareValues (a, b) {
			if (a > b)
				return 1;
			if (a < b)
				return -1;
			return 0;
		}
		
		// test thing
		console.log('TEST:');
		var iterable = [10, 20, 30];
		for (var value of iterable) {
			console.log(value);
		}
		
		// do the thing
		//for (var group of word.groupedEvents) {
		for (var g in word.groupedEvents) {
			var group = word.groupedEvents[g];
			var matchSet = [];
			//for (var evnt of group) {
//			log.info(group.events);
			for (var e in group.events) {
				var evnt = group.events[e];
//				log.info(e);
//				log.info(typeof evnt);
				//log.info(evnt);
				
				if (matchSet.length == 0) {
					matchSet.push(evnt);
				} else if (matchSet[0].sortId[1] == evnt.sortId[1]) {
					matchSet.push(evnt);
				} else {
//					for (var item of matchSet)
//						item.set = matchSet;
					log.info('RESETING MATCHSET:');
					//matchSet = [evnt];
					log.info(matchSet);
				}
			}
			//for (var item of matchSet)
//			for (var i in matchSet) {
//				matchSet[i].set = matchSet;
//			}
		}
	}
	log.info('2 - EVENTS: ' + lexMappings[1].events.length)
}


function eventsMatch (newEvent, oldEvent) {
	if (newEvent.status != oldEvent.status)
		return false;
	if (newEvent.reasons.length != oldEvent.reasons.length)
		return false;
	for (var i = 0; i < newEvent.reasons.length; i++) {
		if (newEvent.reasons[i] != oldEvent.reasons[i])
			return false;
	}
	return true;
}

function wordsInList (list, words) {
	for (var i = 0; i < list.length; i++) {
		var match = true;
		for (var j = 0; j < list[i].words.length; j++) {
			if (list[i].words[j] != words[j])
				match = false;
		}
		if (match)
			return true;
	}
	return false;
}

function parseTMRContents (state, TMRList, sentence) {
	state.parsingTmr = false;
	var newTMRString = state.tmrContents.replace(regex.formatTMR, regex.formatTMRSubstitution).replace(/\'/g, '"');
		//.replace(regex.cleanTMR, regex.cleanTMRSubstitution);
		
//					console.log('PARSING TMR::::::::::::::::::::::::');
	
	var matches = newTMRString.match(regex.cleanTMR);
	var lastIndex = 0;
	if (matches)
		for (var j = 0; j < matches.length; ++j) {
			var startIndex = newTMRString.substr(lastIndex).indexOf(matches[j]) + lastIndex;
			var endIndex = startIndex + matches[j].length + 1;
			newTMRString = newTMRString.substring(0, startIndex) + '"' + matches[j].replace(/\"/g, "'") + '"' + newTMRString.substr(endIndex - 1);
			var lastIndex = endIndex;
//						console.log('startIndex = ' + startIndex + ', endIndex = ' + endIndex + ', matches[j] = ' + matches[j] + ', string = ' + newTMRString.substring(startIndex, endIndex));
		}
//					console.log(newTMRString);
	
	
	//console.log(newTMRString.match(regex.cleanTMR));
	//console.log(TMRString);
	var TMR = JSON.parse(newTMRString);
	if (TMR.sentence == null)
		TMR.sentence = sentence;
	if (TMR['sent-num'] == null)
		TMR['sent-num'] = 1;
	TMRList.push(TMR);
	state.tmrContents = '';	
}