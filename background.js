chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  console.log(tab.url);
  if (tab.url && tab.url.includes("leetcode.com")) {
    chrome.browserAction.enable(tabId);
  } else {
    chrome.browserAction.disable(tabId);
  }
});

chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (/https:\/\/leetcode\.com\/problems\/.*\/submit\//.test(details.url)) {
      console.log("Detected a problem submission attempt:", details.url);

      chrome.storage.local.get(["activeSessionId"], function (result) {
        const activeSessionId = result.activeSessionId;
        console.log("Active session ID:", activeSessionId);
        if (activeSessionId) {
          fetch("https://leetcode.com/session/", {
            method: "PUT",
            headers: {
              authority: "leetcode.com",
              accept: "application/json, text/javascript, */*; q=0.01",
              "accept-language": "en-US,en;q=0.9",
              "cache-control": "no-cache",
              "content-type": "application/json",
              dnt: "1",
              origin: "https://leetcode.com",
              pragma: "no-cache",
              referer: "https://leetcode.com/session/",
              "sec-ch-ua": '"Chromium";v="121", "Not A Brand";v="99"',
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": '"macOS"',
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "user-agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
              "x-requested-with": "XMLHttpRequest",
            },
            body: JSON.stringify({ func: "activate", target: activeSessionId }),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log("Activated session:", data);

              chrome.webRequest.handlerBehaviorChanged();
            })
            .catch((error) =>
              console.error("Error activating session:", error),
            );
        } else {
          console.log("No active session ID available.");
        }
      });

      return { cancel: false };
    }
  },
  { urls: ["https://leetcode.com/problems/*/submit/*"] },
  ["blocking"],
);
