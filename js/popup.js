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
  $("input.block-input-minutes").blur(function() {
    var input = $(this)
    var pluralString = $("span.block-input-minutes-s");
    if (input.val() === "1" || input.val() === "01") {
      pluralString.hide();
    } else {
      pluralString.show();
    }
  });

  $("input.block-input-hours").blur(function() {
    var input = $(this)
    var pluralString = $("span.block-input-hours-s");
    if (input.val() === "1" || input.val() === "01") {
      pluralString.hide();
    } else {
      pluralString.show();
    }
  });

  $("div.activate-button").click(function() {
    if (isSentenceFilled($("div.block-sentence"))) {
      var website = $("input.block-input-website").val().trim();
      var usageMinutes = $("input.block-input-minutes").val().trim();
      var resetHours = $("input.block-input-hours").val().trim();
      var storageObject = {"usageMinutes": usageMinutes,
                           "resetHours": resetHours};


      chrome.storage.sync.get("dally_block_storage", function(dally_object) {
        dally_object[website] = storageObject;
        chrome.storage.sync.set({"dally_block_storage": dally_object}, function() {console.log("saved!")});
      });
    } else {
      chrome.storage.sync.get("dally_block_storage", function(dally_object) {console.log(dally_object);});
      console.log("not filled out yet");
    }
  });
});
