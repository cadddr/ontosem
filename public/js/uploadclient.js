

var setInput = function(textarea, type) {
  var form = $(textarea).parent();
  form.attr("action", "/" + type.toLowerCase());
  var button = form.find("button")[0];

  if(type == "#"){
    form.removeClass("valid-input");
    button.disabled = true;
    button.innerHTML = "Input Logs or a TMR...";
    if(textarea.value.length > 0){
      form.addClass("invalid-input");
    } else {
      form.removeClass("invalid-input");
    }
  } else {
    button.disabled = false;
    form.removeClass("invalid-input");
    form.addClass("valid-input");
    button.innerHTML = "Upload " + type;
    button.style.display = "visible";
  }
};

$("textarea#shared-input").on("input", function(e) {
  var content = this.value || "";
  if(content[0] == ">") {
    setInput(this, "Intermediate");
  } else if (content[0] == "{") {
    setInput(this, "TMR");
  } else {
    setInput(this, "#");
  }
});
