'use strict'

var util = require('util')
var utils = require('./utils.js')
var colors = require('colors')
var log = utils.richLogging

const HT_CHAR_ID = 9
const LF_CHAR_ID = 10
const CR_CHAR_ID = 13
const SPACE_CHAR_ID = 32
const invalidDictCharCodes = [HT_CHAR_ID, LF_CHAR_ID, CR_CHAR_ID, SPACE_CHAR_ID]

const reverseDepTypes = ['ADV', 'ROOT', 'nmod', 'case']

var debugging = false

var regex = {
	'sentence': /(\s*Input Sentence = )(.*)/,
	'sentenceHeader': / ===== SENTENCE ([0-9]*) ,concept_base_number ([0-9]*) =====/,
	'headerDependency': /\s*(\S*) :\s*(-?[0-9]+) ([^,]*), (-?[0-9]+) (.*)/,
	'trimWord': /^(([A-Z]*-?)+)(-[A-Z]+[0-9]+)?$/,
	'wordLexIndex': /^.*-[A-Z]*([0-9]+)$/,
	'dependency': /^\s*====> Processing dependency: \[ (\S*) , ([0-9]*) (\S*) , ([0-9]*) (\S*) \]/,
	'dependencyReplaced': /^\s*====> Depenedency is replaced with: \['(\S*)', ([0-9]*), ([0-9]*)\]/,
	'headSense': /^\s*-->> Head_sense= (.*)/,
	'wordSense': /^\s*-->> Word_sense= (.*)/,
	'word': /^\s*Word = (\S+)/,
	'senses': /^\s*Word = (\S+) is found in Lexicon, number of senses = ([0-9]*)/,
	'synonyms': /^\s*Word = (\S+) is found in ([0-9]*) sense\(s\) as a synonym./,
	//'finalResult': /^\s*\-\- Final result\: Length\=\s*([0-9]*)/,
	
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
	'cleanTMR': /(OrderedDict\(\[[^:]*\]\))/g,
	'convertDict': /\('([^,]*)'\s*,\s*'([^,]*)'\)/,
	'extractPairs':   /\('([^,]*)'\s*,\s*'([^,]*)'\)/g,
	'tuple': /\(([^\)]*)\)/g,
	'tupleSubstitution': '[$1]',
	'tokenizeSentence': /\b([a-zA-Z0-9\-]+)\b/g,
	//'cleanTMRSubstitution': '\'$1\'',
	
	'unknownElement': /^\s*(\S+) has Unknown element "([^"]*)".Skipping it\./,
	'wordSenseSelected': /^\s*Word (\S+) , index= ([0-9]*) has been used with sense= (\S+)/,
	'localLexEntry': /^\s*Word = (\S+) lex entry is stored locally, number of senses = ([0-9]*)/,
	'lexEntryNotFound': /^\s*[iI]nput syn element (\S+)  not found in lex entry (\S+)/
}


function getWordObject (wordParam, lexMappings, tokenIndex) {
	// log.info(('getWordObject (' + wordParam + ', ..., ' + tokenIndex + ')').yellow);
	var word = wordParam.split('-')[0]
	if (wordParam.match(regex.trimWord))
		word = wordParam.match(regex.trimWord)[1];
	
	if (lexMappings[tokenIndex].wordString == undefined)
		lexMappings[tokenIndex].wordString = word
	return lexMappings[tokenIndex]
}

function trimWord (word) {
	return word.match(regex.trimWord)[1];
}

function getLexIndex (wordString) {
	var match = wordString.match(regex.wordLexIndex)
	var index = 0
	if (match)
		index = match[1]
	return parseInt(index)
}

function getWordIndex (wordString, words) {
	for (var w in words)
		if (words[w] == wordString)
			return parseInt(w)
	words.push(wordString)
	return parseInt(words.length - 1)
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
		'sortId': [parseInt(tokenIndex), wordIndex, lexIndex]
	}
}

function createEvent (parsedLine, status, state, lexMappings, words) {
	//log.info(('createEvent(' + parsedLine[1] + ', ' + parsedLine[3] + ')').yellow);
//	log.info(parsedLine);
//	log.info(status);
//	log.info(state);
//	log.info(words);
	
	var event = {
		'depType': state.dependency.type,
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
	
//	logObject('event', event);
	return event;
	
	function makePair (wordA, wordB) {
		
		
		if (wordB) {
			if (state.dependency.eventWord != state.dependency.words[0].index) {
//				console.log(state.headSense)
//				console.log(state.word)
				var temp = wordA
				wordA = wordB
				wordB = temp
			}
			event.type = 'pair';
			event.words = [wordA, wordB];
		} else {
			event.type = 'single';
			event.words = [wordA];
		}
		
//		var indexA = state.dependency.words[0].index;
		var indexA = state.dependency.eventWord;
//		if (wordB == null)
//			indexA = state.dependency.eventWord;
		var wordObjA = getWordObject(wordA, lexMappings, indexA);
		var idDataA = getWordIdData(wordA, lexMappings, words, indexA);
		event.id = idDataA.id;
		event.sortId = idDataA.sortId; //[idData.wordIndex, idData.lexIndex];
		
		if (wordB) {
//			var indexB = state.dependency.words[1].index;
			var indexB = state.dependency.otherWord;
			var wordObjB = getWordObject(wordB, lexMappings, indexB);
			var idDataB = getWordIdData(wordB, lexMappings, words, indexB);
			
			event.id += '-' + idDataB.id;
			event.sortId = event.sortId.concat(idDataB.sortId);//[idData.wordIndex, idData.lexIndex]);
			//wordObjB.events.push(event);
//			wordObjB.events.push(event);
//			log.info('                       pushing event: ' + event.id + ' to events list for ' + wordObjB.index);
		}
//		log.info('                       pushing event: ' + event.id + ' to events list for ' + wordObjA.index);
		event.affectsWord = wordA;
		var eventWord = lexMappings[state.dependency.eventWord]
//		event.otherWord = wordB;
		if (indexB == state.dependency.eventWord) {
//			event.affectsWord = wordB;
//			event.otherWord = wordA;
		}
		//eventWord.events.push(event);
		wordObjA.events.push(event);
		
		if (status == 'skip') {
			for (var i in wordObjA.senses) {
				var sense = wordObjA.senses[i]
				if (sense.senseString == wordA) {
					//log.info('NO MATCH: ' + wordA)
					//log.info(sense)
					sense.status = 'failure'
				}
			}
		}

//		console.log('creating event: ' + status + ' for ' + wordA + ', ' + wordB + '\t --- dep:' + state.dependency.type)
	}
}

function parseBodyLine (lineObject, state, TMRList, sentence, words, lexMappings, events, eventMap, dependencies) {
	var parsedLine;
	var line = lineObject.raw
	
	// if this line is part of a TMR add it to the TMR contents and move on
	if (state.parsingTmr && (line.substring(0,3) != '---' && !isBlankLine(line))) {
		lineObject.type = 'TMR'
		appendTMRContents();
	
	// else parse this line's contents
	} else {
		
		lineObject.type = 'parse'
		
		// parse this TMR line
		if (state.parsingTmr)
			parseTMRContents(state, TMRList, sentence);
		
		
		// skip empty lines
		if (isBlankLine(line)) {
			if (state.parsingTmr)
				appendTMRContents()

		// dependency parsing
		} else if (parsedLine = line.match(regex.dependency)) {
			state.dependency = null
			for (var dep of dependencies) {
				if (dep.type == parsedLine[1] && (dep.words[0].index == parsedLine[2] &&  dep.words[1].index == parsedLine[4]))
					state.dependency = dep
			}
		
		// depdency replacement parsing
		} else if (parsedLine = line.match(regex.dependencyReplaced)) {
			var indexA = parsedLine[2]
			var indexB = parsedLine[3]
			var dependency = createDependency(parsedLine[1], indexA, lexMappings[indexA].token, indexB, lexMappings[indexB].token)
			//dependency.eventWord = state.dependency.eventWord
			//dependency.otherWord = state.dependency.otherWord
			
			lexMappings[dependency.eventWord].dependencies.push(dependency)
			var depIndex = dependencies.indexOf(state.dependency) + 1
			dependencies.splice(depIndex, 0, dependency)
			state.dependency.replaced = true
			state.dependency = dependency
			/*
			state.dependency.type = parsedLine[1]
			state.dependency.words[0].index = index1
			state.dependency.words[0].token = lexMappings[index1].token
			state.dependency.words[1].index = index2
			state.dependency.words[1].token = lexMappings[index2].token
			*/
		// head sense parsing
		} else if (parsedLine = line.match(regex.headSense)) {
			state.headSense = parsedLine[1]
			
		// word sense parsing
		} else if (parsedLine = line.match(regex.wordSense)) {
			state.wordSense = parsedLine[1]
			
		// senses parsing
		} else if (parsedLine = line.match(regex.senses)) {
			state.word = parsedLine[1]
			var index = state.dependency.eventWord
			/*
			log.info(('state = ').yellow)
			log.info(state)
			log.info(('sentence = ' + sentence).yellow)
			log.info(('parsedLine = ').yellow)
			log.info(parsedLine)
			*/
			getWordObject(state.word, lexMappings, index)
			
		// synonym parsing
		} else if (parsedLine = line.match(regex.synonyms)) {
			state.word = parsedLine[1]
			var index = state.dependency.eventWord
			getWordObject(state.word, lexMappings, index)
			
			
		// success parsing
		} else if (parsedLine = line.match(regex.success)) {
			addEvent('match')
			
		// skip parsing
		} else if (parsedLine = line.match(regex.skip)) {
			addEvent('skip')
			
		// falsePositive parsing
		} else if (parsedLine = line.match(regex.falsePositive)) {
			state.reasons.push(line);
			
		// missingRole parsing
		} else if (parsedLine = line.match(regex.missingRole)) {
			state.reasons.push(line);
			
		// constraint parsing
		} else if (parsedLine = line.match(regex.constraint)) {
			state.reasons.push(line);
			
		// requiredWords parsing
		} else if (parsedLine = line.match(regex.requiredWords)) {
			state.reasons.push(line);
			
			
		// shortTermMemory parsing
		} else if (parsedLine = line.match(regex.shortTermMemory)) {
		
		// final results parsing	
		} else if (parsedLine = line.match(regex.finalResult)) {
			//log.info('parsing final results')
			state.parsingFinal = true
			
		// lexStorage parsing
		} else if (parsedLine = line.match(regex.lexStorage)) {
			/*
			lexMappings.forEach(function (mapping) {
				mapping.senses = []
			});
			*/

		// lexEntry parsing
		} else if (parsedLine = line.match(regex.lexEntry)) {
			var tokenIndex = parsedLine[1]
			var senseString = parsedLine[2].replace(regex.formatLexEntry, '')
			var senseList = senseString.split(',')
			lexMappings[tokenIndex].senses = []

			for (var sense of senseList)
				lexMappings[tokenIndex].senses.push(createSense(sense, lexMappings, words, tokenIndex))
			
		// unknownElement parsing
		} else if (parsedLine = line.match(regex.unknownElement)) {
			state.reasons.push(line);
			
		// wordSenseSelected parsing
		} else if (parsedLine = line.match(regex.wordSenseSelected)) {
			
		// localLexEntry parsing
		} else if (parsedLine = line.match(regex.localLexEntry)) {
			
		// lexEntryNotFound parsing
		} else if (parsedLine = line.match(regex.lexEntryNotFound)) {
			state.reasons.push(line);
			
		// tmr parsing
		} else if (line[0] === '{' || line[0] === '[') {
			if (line[0] === '[')
				state.isTMRList = true;
			state.parsingTmr = true;
			lineObject.type = 'TMRStart'
			state.TMRStartLine = lineObject
			appendTMRContents();
			
		//  there was a parse error
		} else {
			//debug(' ************** PARSE ERROR ************** "' + line + '"');
			lineObject.type = 'error'
			state.reasons.push(line);
		}
	}
	
	function appendTMRContents () {
		state.tmrContents += line
		if (state.tmrContents.charCodeAt(state.tmrContents.length-1) === CR_CHAR_ID)
			state.tmrContents += '\n'
		else if (state.tmrContents.charCodeAt(state.tmrContents.length-1) != '\n')
			state.tmrContents += '\n'
	}
	
	function addEvent (type) {
		var event = createEvent(parsedLine, type, state, lexMappings, words)
		events.push(event)
		
		state.dependency.hasEvents = true
		var id = event.sortId
		addToEventMap(id.slice(0,3), parsedLine[1], state.dependency.otherWord)
		//if (id.length > 3)
		//	addToEventMap(id.slice(3,6), parsedLine[3], state.dependency.eventWord)
			
		//debug('setting hasEvents for ')
		//debug(state.dependency)
//		var depIndex = id[3];
//		if (depIndex == null)
//			depIndex = state.dependency.eventWord
			//depIndex = state.dependency.words[1].index
		function addToEventMap (id, senseString, depIndex) {
			//console.log('mapping: ' + id + ': ' + senseString + ' - ' + depIndex)
			var index = id[0];
			var wordSense = id[1] + '.' + id[2];
			if (eventMap[index] == null)
				eventMap[index] = {}
			if (eventMap[index][wordSense] == null) {
				eventMap[index][wordSense] = {}
	//			console.log('adding dummies'.red)
	//			console.log(lexMappings[index].dependencies)
				for (var i = 0; i < lexMappings[index].dependencies.length; i++) {
					var otherWord = parseInt(lexMappings[index].dependencies[i].otherWord)
					if (otherWord == index)
						otherWord = parseInt(lexMappings[index].dependencies[i].eventWord)

					//debug('\t dummmy ' + otherWord)
					eventMap[index][wordSense][otherWord] = {
						'dummy': true,
						'status': 'skip'
					}
				}
			}
			
			

			if (lexMappings[index].senses == null)
				lexMappings[index].senses = []
			
			var newSense = true
			for (var sense of lexMappings[index].senses)
				newSense = newSense && (sense.id != wordSense)
			
			if (newSense)
				lexMappings[index].senses.push(createSense(senseString, lexMappings, words, index))
			//console.log(lexMappings[index].senses)
			
			eventMap[index][wordSense][depIndex] = event;
		}
	}

	function isBlankLine (line) {
		var correctedLine = line.replace(/ /g, '').replace(/\t/g, '')
		return (correctedLine.length == 0 || correctedLine[0] === '\n' || correctedLine[0] === '\r')
		/*
		for (var i in line)
			var charID = line.charCodeAt(i)
			if (invalidDictCharCodes.indexOf(charID) == -1)
				return false
		*/
		//return true
	}
}

function parseLines (lines, startLine, state, TMRList, words, lexMappings, events, eventMap, onlyTMR, dependencies) {
	var line;
	try {
		var rawIndex = 0
		var headerLines = []
		var bodyLines = []
		var readingHeader = true
		var tokens = []
		var sentence = ''
		if (onlyTMR) {
			debug('PARSING A TMR'.green)
			readingHeader = false
		} else {
			debug('PARSING INTERMEDIATE RESULTS'.green)
		}
		
		//debug('*************************************************************************************************************'.green)
		//debug('starting on line' + startLine)
		for (var i = startLine; i < lines.length; i++) {
			//console.log('i = ' + i)
			var lineObject = lines[i]
			line = lineObject.raw
//			if (readingHeader)
//				console.log(rawIndex + ':\t' + line)
			rawIndex += line.length + 1
			
//			console.log(line);
			// check if this is the end of the header
			if ( readingHeader && !(line.substring(0,3) === '>>>' || line[0] === '\t' || line[0] === ' ' || line.match(regex.sentenceHeader)) ) {
				readingHeader = false
				//debug('DONE READING HEADER'.green)
			}
			
			// if we are reading the header parse this line as a header line
			if (readingHeader) {
				headerLines.push(line)
				var parsedLine;
				if (parsedLine = line.match(regex.sentence)) {
					sentence += parsedLine[2]
					tokens = sentence.match(regex.tokenizeSentence)
//					console.log(sentence)
//					console.log(tokens)
					
					for (var t in tokens) {
						var token = tokens[t]
						lexMappings.push({
							'index': t,
							'token': token,
							'events': [],
							'groupedEvents': [],
							'dependencies': [],
							'senses': []
						})
					}
				} else if (parsedLine = line.match(regex.headerDependency)) {
					var dependency = createDependency(parsedLine[1], parsedLine[2], parsedLine[3], parsedLine[4], parsedLine[5])
					dependencies.push(dependency)
					lexMappings[dependency.eventWord].dependencies.push(dependency)
					///console.log(parsedLine[2])
					//if (parsedLine[2] != -1)
					//	lexMappings[parsedLine[2]].dependencies.push(dependency)
				}
			
			// otherwise parse it as a body line
			} else {
				if (line.match(regex.sentenceHeader))				
					return {
						'tokens': tokens,
						'sentence': sentence,
						'lastLine': i
					}
				bodyLines.push(line)
				parseBodyLine(lineObject, state, TMRList, sentence, words, lexMappings, events, eventMap, dependencies)
			}
		}
		
		if (state.tmrContents.length > 0)
			parseTMRContents(state, TMRList, sentence)
		
		//debug('*************************************************************************************************************/'.green)

		return {
			'tokens': tokens,
			'sentence': sentence,
			'lastLine': -1
		}
	} catch (e) {
		e.parseLine = line
		debug('error on line:\t' + line)
		throw e
	}
}

function parseLog (lines, startLine) {
	// initialize variables before parsing
	debug('*************************************************************************************************************'.green)
	var words = [];
	var dependencies = [];
	var events = [];
	var eventMap = {};
	var lexMappings = [];
	var TMRList = [];
	var onlyTMR = isTMRInput(lines[0].raw);
	var state = {
		'dependency': {},
		'word': '',
		'headSense': '',
		'wordSense': '',
		'reasons': [],
		'tmrContents': '',
		'isTMRList': false,
		'parsingTmr': false
	}
	var labels = {
		'match': 'Lexical Match',
		'success': 'Success',
		'skip': 'Skipped',
		'falsePositive': 'False Positive'
	};
	
	
	var parseResults
	
	// if the user gave only a TMR, only parse and return that
	if (onlyTMR) {
		//log.info('lines = ')
		//log.info(lines[0])
		state.parsingFinal = true
		state.tmrContents = lines.rawLines.join('\n')
		//log.info('state.tmrContents = ')
		//log.info(state.tmrContents)
		state.TMRStartLine = lines[0]
		parseTMRContents(state, TMRList, '')
		
		//log.info('TMRList = ')
		//log.info(TMRList)
		//pretty(TMRList[0])
		
		return {
			'data': {'TMRList': TMRList},
			'lastLine': -1
		}
	} else {
		// parse the whole output
		parseResults = parseLines(lines, startLine, state, TMRList, words, lexMappings, events, eventMap, onlyTMR, dependencies);
		//debug('ending on line' + parseResults.lastLine)
	}
	
	// compile the words into a list
	var wordsList = [];
	for (var w in words) {
		var word = words[w]
		wordsList.push(word)
	}
	
	// compile lists of used dependencies
	for (var i in lexMappings) {
		var mapping = lexMappings[i]
		mapping.usedDependencies = []
		for (var d in mapping.dependencies) {
			var dep = mapping.dependencies[d]
			
			if (dep.hasEvents && dep.eventWord == i)
				mapping.usedDependencies.push(dep)
			
			else if (eventMap[i] && !dep.replaced)
				for (var sense in eventMap[i])
					delete eventMap[i][sense][dep.otherWord]
		}
	}
	
	for (var m in lexMappings) {
		var mapping = lexMappings[m]
		var tokenIndex = parseInt(mapping.index)
		mapping.token = parseResults.tokens[tokenIndex]
		mapping.wordString = parseResults.tokens[tokenIndex].toUpperCase()
	}
	

	// group similar events together
	//groupEvents(lexMappings, words)
	
	// build the lexicon entry list
	var lexEntries = {}
	lexMappings.forEach(function (mapping) {
		//console.log(' ----------- ' + mapping.token)
		var index = mapping.index
		//console.log(mapping.senses)
		mapping.senses.forEach(function (sense) {
			//debug(sense)
			var trimmedName = trimWord(sense.senseString)
			var parent = lexEntries[trimmedName]
			if (parent == null)
				parent = { 'id': getWordIdData(trimmedName, lexMappings, words, index).id };
			lexEntries[trimmedName] = parent
			
			lexEntries[sense.senseString] = {
				'parent': parent.id,
				'id': getWordIdData(sense.senseString, lexMappings, words, index).id
			}
			
			// set the status for this sense
			if (eventMap[index] && eventMap[index][sense.id]) {
				var events = eventMap[index][sense.id]
				var matches = 0
				for (var e in events) {
					var event = events[e]
					if (event.status == 'skip')
						sense.status = 'skip'
					else
						++matches
					sense.matches = matches
				}
			}
		});
		
		// sort the list of senses for each lex mapping
		mapping.senses.sort(function (a, b) {
			if (a.status == 'match' && b.status == 'skip')
				return -1
			if (a.status == 'skip' && b.status == 'match')
				return 1
			var matchesResult = 0 - compareValues(a.matches, b.matches)
			if (matchesResult != 0)
				return matchesResult
			return compareValues(a.flatId, b.flatId)
		})
		//console.log(mapping.senses)
		
		mapping.state = 'show';
		if (mapping.usedDependencies.length == 0)
			mapping.state = 'hide'
//			else if (mapping.senses.length == 1)
//				mapping.state = 'hide';
	});

	// annotate the sentence
	//debug('annotating the sentence'.green);
	var sentenceMappings = {};
	/*
	for (var i = 0; i < TMRList[0].results.length; ++i) {
		var frame = TMRList[0].results[i];
		for (var j in frame.TMR) {
			var entry = frame.TMR[j];
			sentenceMappings[entry.token] = entry['from-sense'].match(regex.trimWord)[1];
		}
	}
	*/
//	logObject('eventMap', eventMap, 'yellow')
	
	//log.info('correcting TMRs'.green)
	var finalTMR = TMRList[TMRList.length - 1]
	for (var t in TMRList) {
		var TMR = TMRList[t]
		//log.info('TMR.sent-num = "' + TMR['sent-num'] + '"')
		TMR['sent-num'] = finalTMR['sent-num']
	}
	
	var rawLines = lines.slice(startLine, parseResults.lastLine)
	var rawParse = ''
	for (var line of rawLines)
		rawParse = rawParse + line.raw + '\n'
	
	//log.info('TMRList = ')
	//log.info(TMRList)
	//pretty(TMRList)
	var trueTMRList = []
	if (TMRList.length > 0)
		trueTMRList = [TMRList[0]]
	var data = {'TMRList':trueTMRList, 'words':wordsList, 'sentence':parseResults.sentence, 'labels':labels, 'lexEntries':lexEntries, 'lexMappings':lexMappings, 'sentenceMappings':JSON.stringify(sentenceMappings), 'eventMap':eventMap, 'dependencies': dependencies, 'rawParse': rawParse, 'lines':rawLines};
	return {
		'data': data,
		'lastLine': parseResults.lastLine
	}
}

module.exports = {
	format: function(raw) {
		debug("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@".cyan)
		debug("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ INTERMEDIATE PARSER @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@".cyan)
		debug("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@".cyan)
		var rawLines = raw.split('\n')
		var lines = []
		lines.rawLines = rawLines
		for (var line of rawLines)
			lines.push({'raw':line})

		var results = []
		var lastLine = 0
		while (lastLine != -1) {
			var parseResults = parseLog(lines, lastLine)
			lastLine = parseResults.lastLine
			results.push(parseResults.data)
		}
		debug("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@".cyan)
		debug("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@".cyan)
		debug("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@".cyan)
		return results
	}
};

// group events together
function groupEvents (lexMappings, words) {
	debug("###################################### groupEvents ######################################".green)
	//output('1 - EVENTS: ' + lexMappings[1].events.length, 'yellow')
	//log.info(lexMappings)
	for (var w in lexMappings) {
		var word = lexMappings[w]
		//log.info("word = " + word.wordString);
		for (var e in word.events) {
//			log.info("\te = " + e);
			var event = word.events[e]
//			log.info('\t event = '.yellow);
//			log.info(event);
			
			// if this event has a sense not in the lexMapping's sense list, add it
			var newSense = true
//			log.info('\tword.senses = '.yellow);
//			log.info(word.senses);
			for (var s in word.senses) {
				if (word.senses[s].senseString == event.affectsWord) {
					newSense = false
					break
				}
			}
			if (newSense)
				word.senses.push(createSense(event.affectsWord, lexMappings, words, event.sortId[0]))
			
			// check to see if this event can be added to an existing group
			var addedToGroup = false;
			for (var g in word.groupedEvents) {
//				log.info("\t\tg = " + g)
				var group = word.groupedEvents[g]
//				log.info("\t\tgroup = ")
//				log.info(group)
//				log.info("\t\tword.groupedEvents = ")
//				log.info(word.groupedEvents)
				if (eventsMatch(group.events[0], event)) {
					group.events.push(event)
					group.ids.push(event.id)
					group.multi = true
					addedToGroup = true
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
				})
//				log.info('adding event ' + event.id)
				
			}
		}
		
		// sort this mapping's senses list
//		console.log(word)
		word.senses.sort(function (a, b) {
			return compareValues(a.flatId, b.flatId)
		})
		
//		log.info("word = ")
//		log.info(word)
//		log.info("word.groupedEvents = ")
//		log.info(word.groupedEvents)
		
		// sort the events in each group
		word.groupedEvents.forEach(function (group) {
			group.events.sort(function (a, b) {
				for (var i = 0; i < Math.min(a.sortId.length, b.sortId.length); ++i) {
					var compareResult = compareValues(a.sortId[i], b.sortId[i])
					if (compareResult != 0)
						return compareResult
				}
				return compareValues(a.length, b.length)
			});
		});
		/*		
		// test thing
		console.log('TEST:');
		var iterable = [10, 20, 30];
		for (var value of iterable) {
			console.log(value);
		}
		*/
		// do the thing
		//for (var group of word.groupedEvents) {
		for (var g in word.groupedEvents) {
			var group = word.groupedEvents[g]
			var matchSet = []
			//for (var evnt of group) {
//			log.info(group.events)
			var lastDep = null
			for (var e in group.events) {
				var evnt = group.events[e]
				evnt.col = -1;
				if ( (lastDep != null) && (lastDep[1] != evnt.sortId[1] || lastDep[2] != evnt.sortId[2]) )
					evnt.col = 0
				lastDep = evnt.sortId
				
//				log.info(e)
//				log.info(typeof evnt)
				//log.info(evnt)
				
				/*
				if (matchSet.length == 0) {
					matchSet.push(evnt)
				} else if (matchSet[0].sortId[1] == evnt.sortId[1]) {
					matchSet.push(evnt)
				} else {
//					for (var item of matchSet)
//						item.set = matchSet
//					log.info('RESETING MATCHSET:')
					//matchSet = [evnt]
//					log.info(matchSet)
				}
				*/
			}
			//for (var item of matchSet)
//			for (var i in matchSet) {
//				matchSet[i].set = matchSet
//			}
		}
	}
	//output('2 - EVENTS: ' + lexMappings[1].events.length, 'yellow')
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
	//console.log('state.parsingFinal = ' + state.parsingFinal)
	/*
	console.log('parseTMRContents:'.green)
	log.info(state.tmrContents)
	var TMRCharArray = []
	for (var i = 0; i < 15; i++) {
		if (state.tmrContents.charCodeAt(i) === 13)
			TMRCharArray[i] = '\n'
		else
			TMRCharArray[i] = state.tmrContents[i]
		console.log('   state.tmrContents[' + i + '] =\t ' + state.tmrContents.charCodeAt(i) + ' \t' + state.tmrContents[i])
	}
	var TMRString = TMRCharArray.join('')
	console.log(TMRString)
	console.log(typeof state.tmrContents)
	*/
	//console.log(state)
	state.TMRStartLine.TMRContents = state.tmrContents.substring(0, state.tmrContents.length - 1)
	
	// if this isn't the final results, ignore it
	if (!state.parsingFinal) {
		state.parsingTmr = false
		state.tmrContents = ''
		return
	}

	//console.log('parseTMRContents()'.yellow)
	//console.log(state.tmrContents)
	
	var newTMRString = state.tmrContents.replace(regex.formatTMR, regex.formatTMRSubstitution)//.replace(/\'/g, '"')
	state.parsingFinal = false
	state.parsingTmr = false
	state.tmrContents = ''
	//.replace(regex.cleanTMR, regex.cleanTMRSubstitution)

	// console.log('PARSING TMR::::::::::::::::::::::::');

	var matches = newTMRString.match(regex.cleanTMR);
	// console.log('matches:'.red);
	// console.log(matches);
	var lastIndex = 0;
	if (matches)
		for (var j = 0; j < matches.length; ++j) {
			var startIndex = newTMRString.substr(lastIndex).indexOf(matches[j]) + lastIndex
			var endIndex = startIndex + matches[j].length + 1
			
			var textBefore = newTMRString.substring(0, startIndex)
			var textAfter = newTMRString.substr(endIndex - 1)
			

			//console.log('matches[j] = '.yellow)
			//console.log(matches[j])
			var dictString = convertDict(matches[j])
			//console.log('dictString = '.yellow)
			//console.log(dictString)
			
			newTMRString = textBefore + dictString + textAfter
			lastIndex = startIndex + dictString.length
			//logObject('newTMRString', newTMRString, 0, 'yellow')
		}

	
	//newTMRString = newTMRString.replace(regex.cleanTMR, regex.cleanTMRSubstitution);
	
	// fix single quoted keys in maps
	var inString = false
	var TMRArray = newTMRString.split('')
	for (var i in TMRArray)
		if (TMRArray[i] == '"')
			inString = !inString
		else if (!inString && TMRArray[i] == '\'')
			TMRArray[i] = '"'
	newTMRString = TMRArray.join('')
	
	// remove touples
	newTMRString = newTMRString.replace(regex.tuple, regex.tupleSubstitution)
	
	// parse the TMR as JSON
	//console.log('about to parse TMR: '.yellow)
	//console.log(newTMRString)

	/*
	var stringified = util.inspect(newTMRString, false, 20).replace(/\\n/g, '\n')
	for (var i = 0; i < 100; ++i) {
		console.log('\t' + i + ': \''+stringified.charAt(i)+'\' = '+stringified.charCodeAt(i))
	}

	console.log('************************************'.yellow)
	console.log('newTMRString = %j', newTMRString)
	console.log('************************************'.yellow)
	console.log('newTMRString = ' + stringified)
	console.log('************************************'.yellow)
	console.log(newTMRString)
	console.log('************************************'.yellow)
	*/
	//logObject('newTMRString', newTMRString, 0, 'yellow')
	var TMR = JSON.parse(newTMRString)
	/*
	try {
	} catch (e) {
		//newTMRString = newTMRString.replace()
		TMR = {}
	}*/
	// console.log('result: '.yellow);
	// console.log(TMR);
	// put the parsed TMR(s) in the list
	if (state.isTMRList || TMR.length)
		for (var i = 0; i < TMR.length; ++i)
			addTMR(TMR[i])
	else
		addTMR(TMR)
	
	function addTMR (tmr) {
		// add missing parameters
		if (tmr.sentence == null)
			tmr.sentence = sentence
		if (tmr['sent-num'] == null)
			tmr['sent-num'] = 1
		TMRList.push(tmr)
	}

	function convertDict (dictString) {
		var pairs = dictString.match(regex.extractPairs)
		var dictObject = {}
		for (var p in pairs) {
			var pair = pairs[p]
			var keyAndVal = pair.match(regex.convertDict)
			var key = keyAndVal[1]
			var val = keyAndVal[2]
			dictObject[key] = val
		}

		return JSON.stringify(dictObject)
	}
}

function debug (message) {
	if (debugging)
		console.log(message)
}

function output (message) {
	if (typeof message == 'object')
		message = JSON.stringify(message, null, 4)
	colors.setTheme({
		custom: style
	});
	console.log(message.custom);
}

function logObject (name, obj, indents, style) {
	if (indents == undefined)
		indents = 0
	
	if (style == undefined)
		style = 'white'
	colors.setTheme({
		custom: style
	});

	var message = (name + ' = ').custom
	if (typeof obj == 'object')
			message += pretty(obj)
	else
		message += obj
	console.log(message)
}

function compareValues (a, b) {
	if (a > b)
		return 1
	if (a < b)
		return -1
	return 0
}


function createSense (senseString, lexMappings, words, tokenIndex) {
	//debug('createSense(' + senseString + ', ..., ' + tokenIndex + ')')
	var idData = getWordIdData(senseString, lexMappings, words, tokenIndex)
	return {
		'senseString': senseString,
		'index': tokenIndex,
		'id': idData.wordIndex + '.' + idData.lexIndex,
		'flatId': (idData.wordIndex * 1000) + idData.lexIndex,
		'status': 'match'
	}
}

function createDependency (type, indexA, tokenA, indexB, tokenB) {
	var dep = {
		'type': type,
		'words': [ { 'index': indexA, 'token': tokenA }, { 'index': indexB, 'token': tokenB } ],
		'eventWord': indexA,
		'otherWord': indexB,
		'hasEvents': false,
		'replaced': false
	}
	if (reverseDepTypes.indexOf(type) != -1) {
		dep.eventWord = indexB
		dep.otherWord = indexA
	}
	return dep
}

function isTMRInput (firstLine) {
	if (firstLine[0] == '>' || firstLine.match(regex.sentenceHeader))
		return false;
	return true;
}

function pretty (obj) {
	return '' + util.inspect(obj, false, 20).replace(/\\n/g, '\n')
}



