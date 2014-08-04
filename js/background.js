var ping;

function blockCurrentTab() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.update(tabs[0].id, {url: "http://oneplusone.productions"});
  });
}

function pingIfBlocked(url) {
  chrome.storage.sync.get(null, function(dallyObject) {
    isBlockedWebsite = false;
    matchedBlockWebsite = "";
    for (var website in dallyObject) {
      if (url.indexOf(website) >= 0) {
        isBlockedWebsite = true;
        matchedBlockWebsite = website;
      }
    }

    if (isBlockedWebsite) {
      ping = setInterval(function() {
        chrome.storage.sync.get(matchedBlockWebsite, function(items) {
          websiteObject = items[matchedBlockWebsite];
          if (websiteObject["secondsLeft"] > 0) {
            websiteObject["secondsLeft"] -= 1;
            if (websiteObject["secondsLeft"] === 0) {
              blockCurrentTab();
              var unblockTime = Date.now() + 
                                websiteObject["resetHours"] * 60 * 60 * 1000 -
                                websiteObject["usageMinutes"] * 60 * 1000;
              chrome.alarms.create(matchedBlockWebsite, {when: unblockTime});
              websiteObject["unblockTime"] = unblockTime;
            }
          } else {
            blockCurrentTab();
          }

          var newObject = {};
          newObject[matchedBlockWebsite] = websiteObject;
          chrome.storage.sync.set(newObject);
        });
      }, 1000);
    }
  });
};

chrome.tabs.onActivated.addListener(function(activeInfo) {
  clearInterval(ping);
  var activeTab = chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var currentTab = tabs[0];
    pingIfBlocked(currentTab.url);
  });
});

chrome.tabs.onUpdated.addListener(function(tabID, changeInfo, tab) {
  if (changeInfo.url) {
    clearInterval(ping);
    pingIfBlocked(tab.url);
  }
});

chrome.windows.onFocusChanged.addListener(function(windowID) {
  clearInterval(ping);
  var activeTab = chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var currentTab = tabs[0];
    pingIfBlocked(currentTab.url);
  });
})

chrome.alarms.onAlarm.addListener(function(alarm) {
  chrome.storage.sync.get(alarm.name, function(dallyObject) {
    var websiteObject = dallyObject[alarm.name];
    dallyObject[alarm.name]["secondsLeft"] = dallyObject[alarm.name]["usageMinutes"] * 60;
    chrome.storage.sync.set(dallyObject);
  });
});
