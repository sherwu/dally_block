var browserURL = window.location.href;

chrome.storage.sync.get(null, function(dallyObject) {
  for (var website in dallyObject) {
    if (browserURL.indexOf(website) >= 0) {
      if (dallyObject[website]["secondsLeft"] === 0) {
        window.location.replace("http://oneplusone.productions");
      }
    }
  }
});
