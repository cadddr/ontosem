
$(document).ready(function () {
	var colorList = ['#CCFFCC', '#CCDDFF', '#CCAAFF', '#FFEEEE', '#FFAA66', '#00FF00', '#AAAAAA'];
	var toggle = $("#toggleOptional")[0];
	var optionalAttributes = $(".optional-attributes");
	var isShowingOptionalAttributes = false;

	var toggleOptionalAttributes = function(){
	  isShowingOptionalAttributes = !isShowingOptionalAttributes;

	  for(var i = 0; i < optionalAttributes.length; i++){
	    var el = optionalAttributes[i];
	    $(el).toggleClass("hide");
	  }
	};

	toggle.addEventListener("click", function(e){
	  toggleOptionalAttributes();
	});

	var data = {};
	var dataContainer = $("#dataString");
	if (dataContainer.size() > 0 && $("#dataString")[0].textContent != "")
		data = JSON.parse($("#dataString")[0].textContent);
	console.log(data);
	
	/*
		
	var tmrDataContainer = $("#tmrData");
	if (tmrDataContainer.size() > 0 && $("#tmrData")[0].textContent != "")
		tmrData = JSON.parse($("#tmrData")[0].textContent);
		
	var lexEntries = {};
	var lexEntriesContainer = $("#lexEntries");
	if (lexEntriesContainer.size() > 0 && $("#lexEntries")[0].textContent != "")
		lexEntries = JSON.parse($("#lexEntries")[0].textContent);
*/

	// ********************************************
	// This should probably be done on the server
	var annotateSentence = function(){
	  var sentence = $("#sentence")[0].innerText.split(" ");
	  var annotatedSentence = [];

	  for(index in sentence){
	    annotatedSentence.push({token: sentence[index], id: -1});
	  }

	  for(index in data.tmrs){
	    var tmr = data.tmrs[index];
	    var optionalAttrs = tmr.optional;
	    var wordIndex = -1;
	    optionalAttrs.forEach(function(kvpair){
		if(kvpair.key == "word-ind"){ wordIndex = kvpair.val; }
	    });

	    if(wordIndex != -1){
		annotatedSentence[wordIndex]._id = tmr._id;
	    }
	  }

	  return annotatedSentence;
	};
	// ********************************************

	var reconstructSentence = function(annotatedSentence){
	  var htmlString = "";

	  for(index in annotatedSentence){
	    var chunk = annotatedSentence[index];
	    htmlString += "<span data-entity-id='";
	    htmlString += chunk._id;
	    htmlString += "'>";
	    htmlString += chunk.token;
	    htmlString += "</span> ";
	  }

	  return htmlString;
	};

	$("#sentence")[0].innerHTML = reconstructSentence(annotateSentence());

	
/*
	var entities = data.entities;

	$("[data-entity-id]").on("mouseenter", function(e){
		console.log(e);
	  var entityKey = $(this)[0].innerText;
	  if(entityKey in entities){
	    var relatedEntityIds = entities[entityKey];
	    relatedEntityIds.forEach(function(entityId){
		$("[data-entity-id='" + entityId + "']").toggleClass("highlight");
	    });
	  }
	});
*/


	// parse the sentence
	var parseSentenceRegex = /Intermediate results for: \"(.*)\"/;
	var sentenceContainer = $('#pageHeader');
	//for (var i = 0; i < data.sentenceMappings.length; i++) {
	console.log('YEAH');
	data.sentenceMappings = JSON.parse(data.sentenceMappings);
	console.log(data.sentenceMappings);
	var sentence = data.sentence;
	for (var i in data.sentenceMappings) {
		console.log('i = ');
		console.log(i);
		console.log(data.sentenceMappings[i]);
		var val = data.sentenceMappings[i];
		//var result = sentence.match(new RegExp('\\b' + i + '\\b'));
		var sentence = sentence.replace(new RegExp('\\b' + i + '\\b'), '<span data-entity-id="' + -1 + '" parent-id="' + data.lexEntries[data.sentenceMappings[i]].id + '" class="highlightable">' + i + '</span>');
		console.log(sentence);
		//console.log(result);
		//sentence.replace()
	}
	sentenceContainer.html('Intermediate results for "' + sentence + '"');
	//var sentence sentenceContainer.html().match(parseSentenceRegex)[1];
	
	



	console.log('DOING THE THING');
	//var lexEntries = data.lexEntries;
	//var lexEntries = data;
	console.log('lexEntries = ');
	console.log(data.lexEntries);
	//for (var i = 0; i < lexEntries.length; i++) {
	for (var i in data.lexEntries) {
		//console.log('i = ');
		//console.log(i);
		var lex = data.lexEntries[i];
//		console.log(' > lex = ');
		console.log(lex);
		//if (lex.id >= 10000) {
		if (lex.parent && lex.parent >= 10000) {
			$("[data-entity-id='" + lex.id + "']").css("background-color", colorList[lex.parent-11000]);
			$("[data-entity-id='" + lex.parent + "']").css("background-color", colorList[lex.parent-11000]);
			$("[parent-id='" + lex.parent + "']").css("background-color", colorList[lex.parent-11000]);
			//console.log($("[data-entity-id='" + lex.id + "']"));
		}
	}
	
	$("[data-entity-id]").on("mouseenter", function(e){
		console.log(e);
		//var entityKey = $(this)[0].innerText;
		var entryId = $(this).attr('data-entity-id');
		$("[data-entity-id='" + entryId + "']").toggleClass("highlight");
		var parentId = $(this).attr('parent-id');
		$("[data-entity-id='" + parentId + "']").toggleClass("highlight");
		
		
		/*
		if (entityKey in entities) {
			var relatedEntityIds = entities[entityKey];
			relatedEntityIds.forEach(function(entityId){
				$("[data-entity-id='" + entityId + "']").toggleClass("highlight");
			});
		}*/
	});
	
	$("[data-entity-id]").on("mouseleave", function(e){
	  $("[data-entity-id]").removeClass("highlight");
	});
	
});