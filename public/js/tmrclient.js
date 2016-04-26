var toggle = $("#toggleOptional")[0];
var optionalAttributes = $(".kv-pair-optional");
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


var data = JSON.parse($("#data-sync")[0].textContent || "");

var entities = data.entities;

$("[data-entity-id]").on("mouseenter", function(e){
  var entityKey;
  if ($(this)[0].hasAttribute("data-entity-name"))
    entityKey = $(this).attr("data-entity-name");
  else
    entityKey = $(this)[0].innerText;

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

$(".sentence-header").on("click", function(e){
  var container = $(this).parent();
  container.toggleClass("collapsed");
  if($(container[0]).hasClass("collapsed")){
    $(this).find(".sentence-minimize")[0].innerHTML = "Show";
  } else {
    $(this).find(".sentence-minimize")[0].innerHTML = "Hide";
  }
});

// Avoid horizontal jerking when hiding and unhiding table rows
var table = $("table.tmr")[0];
table.style.width = table.clientWidth + "px";
