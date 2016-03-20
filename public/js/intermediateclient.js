var colorList = ['#CCFFCC', '#CCDDFF', '#CCAAFF', '#FFEEEE', '#FFAA66', '#00FF00', '#AAAAAA'];

var data = {};
var dataContainer = $("#data-sync");
if (dataContainer.size() > 0 && $("#data-sync")[0].textContent != "")
  data = JSON.parse($("#data-sync")[0].textContent);
console.log(data);

// parse the sentence
var parseSentenceRegex = /Intermediate results for: \"(.*)\"/;
var sentenceContainer = $('#pageHeader');
data.sentenceMappings = JSON.parse(data.sentenceMappings);
var sentence = data.sentence;
for (var i in data.sentenceMappings) {
  var val = data.sentenceMappings[i];
  var sentence = sentence.replace(new RegExp('\\b' + i + '\\b'), '<span data-entity-id="' + -1 + '" parent-id="' + data.lexEntries[data.sentenceMappings[i]].id + '" class="highlightable">' + i + '</span>');
  //sentence.replace()
}
sentenceContainer.html('Intermediate results for "' + sentence + '"');

for (var i in data.lexEntries) {
  var lex = data.lexEntries[i];
  console.log(lex);
  if (lex.parent && lex.parent >= 10000) {
    $("[data-entity-id='" + lex.id + "']").css("background-color", colorList[lex.parent-11000]);
    $("[data-entity-id='" + lex.parent + "']").css("background-color", colorList[lex.parent-11000]);
    $("[parent-id='" + lex.parent + "']").css("background-color", colorList[lex.parent-11000]);
  }
}

