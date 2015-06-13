// ================
// Helper functions
// ================

unblockAlert = false;

function generateActiveBlock(website, dataObject) {
  var activeBlock = $("<div>").addClass("active-block");
  var nameLabel = $("<div>").addClass("active-block-name-label").html(website);

  var timeLabelText;
  var timeLabelClass;
  if (dataObject["secondsLeft"] > 0) {
    timeLabelText = "READY TO USE!";
    timeLabelClass = "ready";
    unblockAlert = true;
    console.log("UNBLOCK ALERT TRUE");
  } else {
    var unblockTimeInMinutes = (dataObject["unblockTime"] - Date.now()) / 1000 / 60;
    var hoursLeft = Math.floor(unblockTimeInMinutes / 60);
    var hoursString = "";
    if (hoursLeft > 0) {
      hoursString = hoursLeft.toString() + " h";
    }

    var minutesLeft = Math.round(unblockTimeInMinutes - (hoursLeft * 60));
    var minutesString = minutesLeft.toString() + " m";

    timeLabelText = hoursString + " " + minutesString;
    timeLabelClass = "blocked";
  }

  var timeLabel = $("<div>").addClass("active-block-time-label " + timeLabelClass).html(timeLabelText);
  var deleteIcon = $("<i>").addClass("fa fa-times");
  var editIcon = $("<i>").addClass("fa fa-pencil");

  activeBlock.append(deleteIcon).append(editIcon).append(nameLabel).append(timeLabel);

  return activeBlock;
}

function isSentenceFilled(blockSentence) {
  var filled = true;
  blockSentence.find("input.block-input").each(function() {
    if ($(this).val() == "") {
      filled = false;
    }
  });
  return filled;
}


// ============
// Startup code
// ============

// Populate the current active blocks div and register their event listeners

chrome.storage.sync.get(null, function(dallyObject) {
  console.log(dallyObject);
  for (var website in dallyObject) {
    var activeBlock = generateActiveBlock(website, dallyObject[website]);
    $("div.active-blocks-list").append(activeBlock);
  }
  // Hide the exclamation alert if there isn't a block that's ready.
  if (!unblockAlert) {
    console.log("hide it!");
    $("i.fa-exclamation").hide();
  }
});


// ====================
// After page load code
// ====================

// Event listeners to register after page load

$(function() {
  // Clicking the header opens/closes the active blocks list
  $("div.active-blocks-header").on("click", function() {
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

  // Clicking the 'x' will delete a block
  $("div.active-blocks-list").on("click", "i.fa-times", function() {
    var activeBlock = $(this).closest("div.active-block");
    var website = activeBlock.find("div.active-block-name-label").html().trim();
    chrome.storage.sync.remove(website, function() {
      activeBlock.fadeOut("fast");
    });
  });

  // Clicking the 'pencil' will edit a block
  $("div.active-blocks-list").on("click", "i.fa-pencil", function() {
    var activeBlock = $(this).closest("div.active-block");
    var website = activeBlock.find("div.active-block-name-label").text().trim();
    chrome.storage.sync.get(website, function(dallyObject) {
      var currentViewBlock = $("div.current-view-block");
      currentViewBlock.find("input.block-input-website").val(website);
      currentViewBlock.find("input.block-input-minutes").val(dallyObject[website]["usageMinutes"]).focus().blur();
      currentViewBlock.find("input.block-input-hours").val(dallyObject[website]["resetHours"]).focus().blur();
    })
  });

  // Entering 1 into the allow time will remove the plural 's'
  $("input.block-input-allow-time").on("blur", function() {
    var input = $(this)
    var pluralString = $("span.block-input-allow-unit-s");
    if (input.val() === "1" || input.val() === "01") {
      pluralString.hide();
    } else {
      pluralString.show();
    }
  });

  // Entering 1 into the block time will remove the plural 's'
  $("input.block-input-block-time").on("blur", function() {
    var input = $(this)
    var pluralString = $("span.block-input-block-unit-s");
    if (input.val() === "1" || input.val() === "01") {
      pluralString.hide();
    } else {
      pluralString.show();
    }
  });

  // Clicking the activate button will start the block.
  $("div.activate-button").on("click", function() {
    if (isSentenceFilled($("div.block-sentence"))) {
      var website = $("input.block-input-website").val().trim();
      var usageMinutes = $("input.block-input-minutes").val().trim();
      var resetHours = $("input.block-input-hours").val().trim();
      var setObject = {};
      setObject[website] = {"usageMinutes": usageMinutes,
                            "resetHours": resetHours,
                            "secondsLeft": usageMinutes * 60,
                            "unblockTime": -1};

      chrome.storage.sync.set(setObject, function() {
        var activeBlock = generateActiveBlock(website, setObject);
        activeBlock.hide();
        $("div.active-blocks-list").append(activeBlock);
        activeBlock.fadeIn("fast");
      });
    } else {
      // TODO: expected behavior here?
      console.log("lolz");
      //chrome.storage.sync.clear();
    }
  });

});
