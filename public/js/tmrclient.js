var toggleOptional = $("#toggleOptional")[0];
var toggleDebugging = $("#toggleDebugging")[0];
var optionalAttributes = $(".kv-pair-optional");
var debuggingAttributes = $(".kv-pair-debugging");

var toggleDebuggingAttributes = function(){
  for(var i = 0; i < debuggingAttributes.length; i++){
    var el = debuggingAttributes[i];
    $(el).toggleClass("hide");
  }
};

var toggleOptionalAttributes = function(){
  for(var i = 0; i < optionalAttributes.length; i++){
    var el = optionalAttributes[i];
    $(el).toggleClass("hide");
  }
};

toggleOptional.addEventListener("click", function(e){
  toggleOptionalAttributes();
});

toggleDebugging.addEventListener("click", function(e){
  toggleDebuggingAttributes();
});


// This fetches the raw JSON that is hidden in the DOM
// that is necessary for some of the final front-end decoration
var data = JSON.parse($("#data-sync")[0].textContent || "");



$("[data-entity-id]").on("mouseenter", function(e){
  var sentenceID = parseInt($(this).closest("section").attr("data-sentence-id")) - 1;
  var entities = data[sentenceID].entities;
  var entityKey;

  // If it is a registered entity, get its entity name
  // else, assume its content is its entity name
  if ($(this)[0].hasAttribute("data-entity-name"))
    entityKey = $(this).attr("data-entity-name");
  else
    entityKey = $(this)[0].innerText;

  if(entityKey in entities){
    // Get the related entities
    var relatedEntityIds = entities[entityKey];

    // Highlight all of the related entities
    relatedEntityIds.forEach(function(entityId){
      $("section[data-sentence-id='" + (sentenceID+1) + "'] [data-entity-id='" + entityId + "']").toggleClass("highlight");
    });
  }
});

// Remove highlighting when the mouse moves off
$("[data-entity-id]").on("mouseleave", function(e){
  $("[data-entity-id]").removeClass("highlight");
});

// Allow users to collapse sentence blocks
$(".sentence-header").on("click", function(e){
  var container = $(this).parent();
  container.toggleClass("collapsed");
  if($(container[0]).hasClass("collapsed")){
    $(this).find(".sentence-minimize")[0].innerHTML = "Show";
  } else {
    $(this).find(".sentence-minimize")[0].innerHTML = "Hide";
  }
});
