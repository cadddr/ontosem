

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
var entities = data.entities;

for(key in entities){
  console.log(key);
  console.log(entities[key]);
}



