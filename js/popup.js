// ================
// Helper functions
// ================

unblockAlert = false;

function generateMessageBlock(message) {
  var messageBlock = $("<div>").addClass("message-block").html(message);
  return messageBlock;
}

function generateActiveBlock(website, dataObject) {
  // Given a website string and a dataObject, returns a jQuery DOM element for displaying it.
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
  // Returns whether or not the sentence form is filled in or not.
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
  console.log("dallyObject" + dallyObject);
  console.log("dallyObjectSize" + Object.keys(dallyObject).length);
  if (Object.keys(dallyObject).length == 0) {
    console.log("yay");
    $("div.active-blocks-list").append(generateMessageBlock(
      "You are currently not blocking any websites! Add a block below to increase your productivity!"));
  } else {
    for (var website in dallyObject) {
      var activeBlock = generateActiveBlock(website, dallyObject[website]);
      $("div.active-blocks-list").append(activeBlock);
    }
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

  // Entering 1 into the minutes time will remove the plural 's'
  $("input.block-input-minutes").on("blur", function() {
    var input = $(this)
    var pluralString = $("span.block-input-minutes-s");
    if (input.val() === "1" || input.val() === "01") {
      pluralString.hide();
    } else {
      pluralString.show();
    }
  });

  // Entering 1 into the hours time will remove the plural 's'
  $("input.block-input-hours").on("blur", function() {
    var input = $(this)
    var pluralString = $("span.block-input-hours-s");
    if (input.val() === "1" || input.val() === "01") {
      pluralString.hide();
    } else {
      pluralString.show();
    }
  });

  // Clicking the activate button will start the block.
  $("div.activate-button").on("click", function() {
    if (isSentenceFilled($("div.block-sentence"))) {
      // Gather the information from the form.
      var website = $("input.block-input-website").val().trim();
      var usageMinutes = $("input.block-input-minutes").val().trim();
      var resetHours = $("input.block-input-hours").val().trim();
      var setObject = {};
      setObject = {"usageMinutes": usageMinutes,
                   "resetHours": resetHours,
                   "secondsLeft": usageMinutes * 60,
                   "unblockTime": -1};

      // Generate the dom element and fade it in.
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
