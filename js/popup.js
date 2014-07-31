function isSentenceFilled(blockSentence) {
  var filled = true;
  blockSentence.find("input.block-input").each(function() {
    if ($(this).val() == "") {
      filled = false;
    }
  });
  return filled;
}

$(function() {
  $("input.block-input").blur(function() {
  });
});
