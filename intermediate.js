var utils = require('./utils.js');
var log = utils.richLogging;

var wordRegex = /^\s*Word = (\S+)/;
var sensesRegex = /^\s*Word = \S+ is found in Lexicon, number of senses = ([0-9]*)/;
var synonymsRegex = /^\s*Word = \S+ is found in ([0-9]*) sense\(s\) as a synonym./;
var skipRegex = /^\tSkipping (\S+)( - (\S+) pair.)?/;
var falsePositiveRegex = /^Removing a false positive result: (\{([0-9]*\: \'(\S+)\',? ?)*})/;
var formatFalsePositiveRegex = /\{|\}|\s*[0-9]*\: |'/g;
var finalResultRegex = /^\s*\-\- Final result\: Length\=\s*([0-9]*)/;
var formatTMRRegex = /((\{|,)\s*)([0-9]+)(\:\s*)/g;
var formatTMRSubstitution = '$1\"$3\"$4';
var sentenceRegex = /(\s*Input Sentence = )(.*)/;
var trimWordRegex = /([a-zA-Z]+)-[a-zA-Z0-9]+/;

function getWordObject (wordParam, words) {
  var word = wordParam.split('-')[0];
  if (words[word])
    return words[word];
  else
    return (words[word] = {
      'word':word,
      'events':[]
    });
}

function getWord (line) {
  var matches = line.match(wordRegex);
  if (matches)
    return matches[1];
  return null;
}

function bindListeners () {
  $('.wordHeader').on('click', function (a, b) {
    console.log(a)
    console.log(b)
    console.log(this)
    console.log($(this))
    var id = $(this).html() + '_ID';
    var table = $('#' + id);
    console.log(table);
    toggleExpanded(table);
  });
}

// called when the user clicks the show/hide layout adjustments twistie
function toggleExpanded (table) {
  var propsRow = table.find('tr.propertiesRow')
  var tbody = table.find('tbody')
  if (table.hasClass('closed')) {
    table.removeClass('closed').addClass('open');
    //propsRow.slideDown(300);
    //tbody.slideDown(300);
  } else {
    table.removeClass('open').addClass('closed');
    //propsRow.addClass;
    //tbody.slideUp(300);
    //propsRow.slideUp(300);
    //tbody.slideUp(300);
    //tbody
      //.wrapInner('<div />')
      //.animate({ height: 0 })
      //.find('td')
      //.children()
      //.slideUp(function() { tbody.addClass('hidden'); });
      //.slideUp(function() { $(this).closest('tr').remove(); });
  }
}

module.exports = {
  format: function(raw) {
    
    var lines = raw.split('\n');
    var headerLines = [];
    var bodyLines = [];
    var readingHeader = true;
    var words = {};
    var word = "";
    var sentence = "Nothing...";
    var rawIndex = 0;
    
    var labels = {
      'skip':'Skipped',
      'falsePositive':'False Positive'
    };
    
    
    var reasons = [];
    
    console.log('LINES:');
    console.log('*************************************************************************************************************');
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (readingHeader)
        console.log(rawIndex + ':\t' + line);
      rawIndex += line.length + 1;
      
      // header parsing
      //if ( readingHeader && !(line.startsWith('>>>') || line.startsWith('\t')) )
      if ( readingHeader && !(line.substring(0,3) === '>>>' || line[0] === '\t') )
        readingHeader = false;
      
      if (readingHeader) {
        headerLines.push(line);
        var sentenceParse = line.match(sentenceRegex);
        if (sentenceParse) {
          sentence = sentenceParse[2];
        }
      } else {
        bodyLines.push(line);
      }
      
      // word parsing
      var thisWord = getWord(line);
      if (thisWord) {
        word = thisWord;
        //console.log(line);
  //          console.log('WORD: ' + word);
        /*if (words[word]) {
          console.log(' > it exists');
        } else {
          console.log(' > new word');
          words[word] = {
            'word':word,
            'events':[]
          };
        }*/
        getWordObject(word, words);
        
        var senses = line.match(sensesRegex);
        if (senses)
          words[word]['senses'] = parseInt(senses[1]);
          
        var synonyms = line.match(synonymsRegex);
        if (synonyms)
          words[word]['synonyms'] = parseInt(synonyms[1]);
      } else {
        
        // semantic parse parsing
        if (word) {
          
          var skip = line.match(skipRegex);
          var falsePositive = line.match(falsePositiveRegex);
          var finalResult = line.match(finalResultRegex);
          var event = {'reasons':reasons};
          
          if (skip) {
            // this line skips a lexicon entry
            var skipA = skip[1];
            var skipB = skip[3];
            event.status = 'skip';
            
            if (skipB) {
              event.type = 'pair';
              event.words = [skipA, skipB];
            } else {
              event.type = 'single';
              event.words = [skipA];
            }
            
            var wordA = getWordObject(skipA, words);
            wordA.events.push(event);
            if (skipB) {
              var wordB = getWordObject(skipB, words);
              wordB.events.push(event);
            }
            
            reasons = [];
            
          } else if (falsePositive) {
            // this line removes a false positive
  //              console.log('@@@@@@@@@@falsePositive');
            var wrongMeaning = falsePositive[1].replace(formatFalsePositiveRegex, '').split(',');
            event.status = 'falsePositive';
            event.words = [];
  //              console.log(wrongMeaning);
            for (var index in wrongMeaning) {
  //                console.log(wrongMeaning[index]);
              event.words.push(wrongMeaning[index]);
            }
            for (var index in wrongMeaning) {
              var wrongWord = getWordObject(wrongMeaning[index], words);
              wrongWord.events.push(event);
  //                console.log(wrongWord);
            }
            reasons = [];
          } else if (finalResult) {
  //              console.log('@@@@@@@finalResult');
  //              console.log(finalResult);
  //              console.log('rawIndex = ' + rawIndex);
            i = lines.length;
          } else {
            // this line is a parse error
            // this line is a parse error
            reasons.push(line);
          }
        }
      }
    }
    console.log('*************************************************************************************************************');
    
    // get TMR object
    var searching = true;
    var lastIndex = raw.length - 1;
    while (searching) {
      if (raw[lastIndex] == '}')
        searching = false;
      else
        --lastIndex;
    }
    var TMRString = raw.substring(rawIndex, lastIndex + 1);
    var newTMRString = TMRString.replace(formatTMRRegex, formatTMRSubstitution).replace(/\'/g, '"');
    //console.log(TMRString);
    //console.log(newTMRString);
    var TMR = JSON.parse(newTMRString);
    //console.log(TMR);
    //console.log(words);
    log.info(TMR);
    //var sentence = "John gave Mary a book.";
    var wordsList = [];
    for (var w in words) {
      var word = words[w];
      wordsList.push(word);
    }
    
    // build the lexicon entry list
    var id = 1000;
    var lexEntries = {};
    for (var w in wordsList) {
      //lexEntries["'" + wordsList[w].word + "'"] = {'id':id+10000};
      lexEntries[wordsList[w].word] = {'id':id+10000};
      log.info("w = " + w);
      log.info("wordsList[w] = " + wordsList[w]);
      log.info("wordsList[w].word = " + wordsList[w].word);
      ++id;
    }
    log.info("wordsList = ");
    log.info(wordsList);
    for (var w in wordsList) {
      var word = wordsList[w];
//      lexEntries[word] = {'id':id+10000};
//      log.info('w = ' + w);
//      log.info('word = ');
//      log.info(word);
      for (var e in word.events) {
        var event = word.events[e];
        for (var entry in event.words) {
          var lexEntry = event.words[entry];
          log.info("lexEntry = ");
          log.info(lexEntry);
          if (lexEntries[lexEntry] == null) {
            //log.info("lexEntry = " + lexEntry);
            var trimmedName = lexEntry.match(trimWordRegex)[1];
            log.info("trimmedName = " + trimmedName);
            log.info("lexEntries[trimmedName] = ");
            log.info(lexEntries[trimmedName]);
            
            var entryObject = {'id':id, 'parent':lexEntries[trimmedName].id};
            //var entryObject = {'id':id};
            //lexEntries[wordsList[w]];
            //lexEntries[lexEntry] = {'id':id};
            lexEntries[lexEntry] = entryObject;
            
            ++id;
          }
          //log.info(' > lexEntry = ' + lexEntry);
        }
      }
      //lexEntries.push(word);
    }
    
    // group events together
    for (var w in wordsList) {
      var word = wordsList[w];
//      log.info('w = ' + w);
//      log.info('word = ');
//      log.info(word);
      var newEvents = [];
      for (var e in word.events) {
        var event = word.events[e];
        var searching = true;
        for (var ne = 0; ne < newEvents.length; ne++) {
          var newEvent = newEvents[ne];
          if (eventsMatch(newEvent, event)) {
            searching = false;
            ne = newEvents.length;
            //newEvent.words.push(event.words);
            newEvent.multi = true;
/*            
            if (newEvent.type == 'pair') {
              log.info("@@@@@@@@@@@@@@@@@ BEFORE ")
              log.info(event.words)
              log.info(newEvent.words)
              //log.info(newEvent.words.concat(event.words))
            }
*/            
            //newEvent.words = newEvent.words.concat(event.words);
            if (!wordsInList(newEvent.words, event.words))
              newEvent.words.push(event.words);
/*            
            if (newEvent.type == 'pair') {
              log.info("@@@@@@@@@@@@@@@@@ AFTER ")
              log.info(newEvent.words)
            }
*/            
          }
        }
        if (searching) {
/*        
          if (event.type == 'pair') {
            log.info("ADDED  A!!!!!!!!!")
            log.info(event.words)
          }
*/          
          var newEvent = {'type':event.type, 'status':event.status, 'reasons':event.reasons};
          newEvent.multi = false;
          newEvent.words = [event.words];
          newEvents.push(newEvent);
/*          
          if (event.type == 'pair') {
            log.info("ADDED  B!!!!!!!!!")
            log.info(event.words)
            log.info(newEvent.words)
          }
*/          
        }
        
        /*
        for (var entry in event.words) {
          var lexEntry = event.words[entry];
          if (lexEntries[lexEntry] == null) {
            lexEntries[lexEntry] = {'id':id};
            ++id;
          }
          //log.info(' > lexEntry = ' + lexEntry);
        }*/
      }
      
      wordsList[w].events = newEvents;
      //lexEntries.push(word);
    }
    
    log.info('aAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
    log.info(lexEntries);
    
    // annotate the sentence
    log.info(newTMRString);
    log.info(TMR);
    var sentenceMappings = {};
    for (var i = 0; i < TMR.results.length; ++i) {
      log.info('i = ');
      log.info(i);
      var frame = TMR.results[i];
      for (var j in frame.TMR) {
        log.info('j = ');
        log.info(j);
        var entry = frame.TMR[j];
        sentenceMappings[entry.token] = entry['from-sense'].match(trimWordRegex)[1];
      }
    }
    log.info('sentenceMappings = ');
    log.info(sentenceMappings);
    
    var data = {'TMR':TMR, 'words':wordsList, 'sentence':sentence, 'labels':labels, 'lexEntries':lexEntries, 'sentenceMappings':JSON.stringify(sentenceMappings)};
//    log.info("---------------------------------------------------------------------------------------------")
//    log.info("data = ")
//    log.info(data)
//    log.info("---------------------------------------------------------------------------------------------")
    return data;
  }
};




function eventsMatch (newEvent, oldEvent) {
  if (newEvent.status != oldEvent.status)
    return false;
  if (newEvent.reasons.length != oldEvent.reasons.length)
    return false;
  for (var i = 0; i < newEvent.reasons.length; i++) {
    if (newEvent.reasons[i] != oldEvent.reasons[i])
      return false;
  }
//  if (newEvent.type == 'pair') {
//    log.info("eventsMatch()------------------------------")
//    log.info(newEvent.reasons)
//    log.info(oldEvent.reasons)
//  }
  return true;
}

function wordsInList (list, words) {
//  log.info("words()^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
//  log.info(list)
//  log.info(words)

  for (var i = 0; i < list.length; i++) {
    var match = true;
    for (var j = 0; j < list[i].length; j++) {
      if (list[i][j] != words[j])
        match = false;
    }
    if (match)
      return true;
  }
  return false;
}






    /*
    
    // Passed a raw JSON TMR, returns a formatted and annotated
    // JSON object to render the decorated TMR to the browser
  
    var o = [];
    var tmr = data.results[0].TMR;
    var entities = {};
    var nextEntityIdNumber = 0;

    log.attn("Interpreting TMR...");
    log.info("Sentence: " + data.sentence);

    // Get an array of the frame heads
    var frames = Object.keys(tmr);

    log.info("Frame heads: " + frames.join(" "));
    frames.forEach(function(frameName){
      var p = {};
      var frame = tmr[frameName];
      p._key = frameName;
      p.attrs = [];
      p.optional = [];

      // Special case for tagging the "head" of each frame
      entities = tagEntity(frameName, entities, nextEntityIdNumber);
      p._id  = nextEntityIdNumber;
      p.color = generateColor(nextEntityIdNumber);
      // -----------

      nextEntityIdNumber += 1;

      // Now loop through all child entities in the frame
      // and do the same thing
      Object.keys(frame).forEach(function(attrKey){
        var attrVal = frame[attrKey];
        entities = tagEntity(attrVal, entities, nextEntityIdNumber);

        // Mark whether an entry should be hidden based on
        // whether or not the key of that entry is capitalized
        if(utils.isCapitalized(attrKey)){
          p.attrs.push({key: attrKey, val: attrVal, _id: nextEntityIdNumber});
        } else {
          p.optional.push({key: attrKey, val: attrVal, _id: nextEntityIdNumber});
        }

        // Get the next ID ready!
        nextEntityIdNumber += 1;
      });

      // Add the annotated frame to our entire set of TMR frames
      o.push(p);
    });

    // Log the entire set of TMR frames
    log.info(o);

    // Return the annotated set along with the collection of
    // known entities, as well as the sentence itself.
    return {sentence: data.sentence, entities: entities, tmrs: o};
  */
