var toggleOptional = $("#toggleOptional")[0];
var toggleDebug = $("#toggleDebug")[0];
var optionalAttributes = $(".kv-pair-optional");
var debugAttributes = $(".kv-pair-debug");

var toggleOptionalAttributes = function(){
  for(var i = 0; i < optionalAttributes.length; i++){
    var el = optionalAttributes[i];
    $(el).toggleClass("hide");
  }
};

var toggleDebugAttributes = function(){
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


$("[data-entity-id]").on("mouseenter", function(e){
  var sentenceID = parseInt($(this).closest("section").attr("data-sentence-id")) - 1;
  var entities = data[sentenceID].entities;
  var entityKey;
  if ($(this)[0].hasAttribute("data-entity-name"))
    entityKey = $(this).attr("data-entity-name");
  else
    entityKey = $(this)[0].innerText;

  if(entityKey in entities){
    var relatedEntityIds = entities[entityKey];
    relatedEntityIds.forEach(function(entityId){
      $("section[data-sentence-id='" + (sentenceID + 1) + "'] [data-entity-id='" + entityId + "']").addClass("highlight");
      $("section[data-sentence-id='" + (sentenceID + 1) + "'] [data-entity-id='" + entityId + "']").attr("style", "background-color: "+data[sentenceID].colors[entityKey]);
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
  var sentenceID = parseInt($(this).closest("section").attr("data-sentence-id")) - 1;
  var entities = data[sentenceID].entities;
  var entityKey;
  if ($(this)[0].hasAttribute("data-entity-name"))
    entityKey = $(this).attr("data-entity-name");
  else
    entityKey = $(this)[0].innerText;

  if(entityKey in entities){
    var relatedEntityIds = entities[entityKey];
    relatedEntityIds.forEach(function(entityId){
      $("section[data-sentence-id='" + (sentenceID + 1) + "'] [data-entity-id='" + entityId + "']").toggleClass("lock");
      if (!$("section[data-sentence-id='" + (sentenceID + 1) + "'] [data-entity-id='" + entityId + "']").hasClass("lock")){
        $("section[data-sentence-id='" + (sentenceID + 1) + "'] [data-entity-id='" + entityId + "']").removeClass("highlight");
        $("section[data-sentence-id='" + (sentenceID + 1) + "'] [data-entity-id='" + entityId + "']").removeAttr("style");
      }
      else{
        $("section[data-sentence-id='" + (sentenceID + 1) + "'] [data-entity-id='" + entityId + "']").addClass("highlight");
        $("section[data-sentence-id='" + (sentenceID + 1) + "'] [data-entity-id='" + entityId + "']").attr("style", "background-color: "+data[sentenceID].colors[entityKey]);
      }
    });
  }
});
