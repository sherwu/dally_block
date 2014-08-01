// Populate the current active blocks div

chrome.storage.sync.get(null, function(dally_object) {
  console.log(dally_object);
  for (var website in dally_object) {
    console.log(website);
    var activeBlock = $("<div>").addClass("active-block");
    var nameLabel = $("<div>").addClass("active-block-name-label").html(website);
    var timeLabel = $("<div>").addClass("active-block-time-label ready").html("READY TO USE!");
    var deleteIcon = $("<i>").addClass("fa fa-times");
    var editIcon = $("<i>").addClass("fa fa-pencil");

    activeBlock.append(deleteIcon)
               .append(editIcon)
               .append(nameLabel)
               .append(timeLabel);
    $("div.active-blocks-list").append(activeBlock);
  }
});


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
  $("div.active-blocks-header").click(function() {
    var header = $(this);
    if (header.hasClass("collapsed")) {
      header.removeClass("collapsed");
      header.find("i.fa-caret-right").removeClass("fa-caret-right").addClass("fa-caret-down");
      $("body").animate({height: "401px"}, "fast");
    } else {
      $(this).addClass("collapsed");
      header.find("i.fa-caret-down").removeClass("fa-caret-down").addClass("fa-caret-right");
      $("body").animate({height: "200px"}, "fast");
    }

    $("div.active-blocks-list").slideToggle("fast");
  });

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
      var setObject = {};
      setObject[website] = {"usageMinutes": usageMinutes,
                            "resetHours": resetHours};

      chrome.storage.sync.set(setObject, function() {console.log("saved!")});
      chrome.storage.sync.get(website, function(items) {
        console.log(items);
      })
    } else {
      chrome.storage.sync.clear();
    }
  });
});
