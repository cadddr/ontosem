

var toggleOptional = $("#toggleOptional")[0];
var toggleDebug = $("#toggleDebug")[0];
var optionalAttributes = $(".optional-attributes");
var debugAttributes = $(".debug-attributes");
var isShowingOptionalAttributes = true;
var isShowingDebugAttributes = true;

var toggleOptionalAttributes = function(){
  isShowingOptionalAttributes = !isShowingOptionalAttributes;

  for(var i = 0; i < optionalAttributes.length; i++){
    var el = optionalAttributes[i];
    $(el).toggleClass("hide");
  }
};

var toggleDebugAttributes = function(){
  isShowingDebugAttributes = !isShowingDebugAttributes;

  for(var i = 0; i < debugAttributes.length; i++){
    var el = debugAttributes[i];
    $(el).toggleClass("hide");
  }
};

toggleOptional.addEventListener("click", function(e){
  toggleOptionalAttributes();
});

toggleDebug.addEventListener("click", function(e){
  toggleDebugAttributes();
});

function swapElem(elem1,elem2){
  elem1.parentNode.insertBefore(elem2,elem1);
}

function insertLinked(elem){
  ;
}

var data = JSON.parse($("#data-sync")[0].textContent);

/* Not used anymore with sentence given entity name and id (I think)
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
*/

var entities = data.entities;
console.log(data.entities);

$("[data-entity-id]").on("mouseenter", function(e){
  var entityKey;
  if ($(this)[0].hasAttribute("data-entity-name"))
    entityKey = $(this).attr("data-entity-name");
  else
    entityKey = $(this)[0].innerText;

  if(entityKey in entities){
    var relatedEntityIds = entities[entityKey];
    relatedEntityIds.forEach(function(entityId){
      $("[data-entity-id='" + entityId + "']").addClass("highlight");
      $("[data-entity-id='" + entityId + "']").attr("style", "background-color: "+data.colors[entityKey]);
    });
  }
});

$("[data-entity-id]").on("mouseleave", function(e){
  $("[data-entity-id]").each(function(index, entity){
    if (!$(entity).hasClass("lock")){
      $(entity).removeClass("highlight");
      $(entity).removeAttr("style");
    }
  });
});

$("[data-entity-id]").on("click", function(e){
  var entityKey;
  if ($(this)[0].hasAttribute("data-entity-name"))
    entityKey = $(this).attr("data-entity-name");
  else
    entityKey = $(this)[0].innerText;

  if(entityKey in entities){
    var relatedEntityIds = entities[entityKey];
    relatedEntityIds.forEach(function(entityId){
      $("[data-entity-id='" + entityId + "']").toggleClass("lock");
      if (!$("[data-entity-id='" + entityId + "']").hasClass("lock")){
        $("[data-entity-id='" + entityId + "']").removeClass("highlight");
        $("[data-entity-id='" + entityId + "']").removeAttr("style");
      }
      else{
        $("[data-entity-id='" + entityId + "']").addClass("highlight");
        $("[data-entity-id='" + entityId + "']").attr("style", "background-color: "+data.colors[entityKey]);
      }
    });
  }
});
