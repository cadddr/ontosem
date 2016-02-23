

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


var data = JSON.parse($("#data-sync")[0].textContent);

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



var entities = data.entities;

$("[data-entity-id]").on("mouseenter", function(e){
  var entityKey = $(this)[0].innerText;
  if(entityKey in entities){
    var relatedEntityIds = entities[entityKey];
    relatedEntityIds.forEach(function(entityId){
      $("[data-entity-id='" + entityId + "']").toggleClass("highlight");
    });
  }
});

$("[data-entity-id]").on("mouseleave", function(e){
  $("[data-entity-id]").removeClass("highlight");
});
