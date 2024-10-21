chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed or updated');
  
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: [{
      id: 1,
      priority: 1,
      action: { 
        type: "modifyHeaders",
        requestHeaders: [
          { header: "X-LeetShare-Intercept", operation: "set", value: "true" }
        ]
      },
      condition: {
        urlFilter: "||leetcode.com/problems/*/submit/",
        resourceTypes: ["xmlhttprequest"]
      }
    }]
  });
});


chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.sessionChanged && changes.sessionChanged.newValue === true) {
    console.log('Session changed detected');
    handleSessionChange();
  }
});

async function handleSessionChange() {
  try {
    const result = await chrome.storage.local.get(['activeSessionId', 'sessionChanged']);
    const activeSessionId = result.activeSessionId;
    console.log("Active session ID:", activeSessionId);

    if (activeSessionId) {
      const response = await fetch("https://leetcode.com/session/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "Origin": "https://leetcode.com",
          "Referer": "https://leetcode.com/session/",
        },
        body: JSON.stringify({ func: "activate", target: activeSessionId }),
        credentials: 'include',
      });
      
      console.log("Response status:", response.status);
      
      const text = await response.text();
      console.log("Response text:", text);
      
      let data;
      try {
        data = JSON.parse(text);
        console.log("Activated session:", data);
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        console.error("Raw response:", text);
      }
    } else {
      console.log("No active session ID available.");
    }

    await chrome.storage.local.set({ sessionChanged: false });
  } catch (error) {
    console.error("Error handling session change:", error);
  }
}

chrome.webRequest.onBeforeSendHeaders.addListener(
  async (details) => {
    if (details.url.includes("/problems/") && details.url.includes("/submit/")) {
      console.log("Detected a problem submission attempt:", details.url);

      const result = await chrome.storage.local.get(["activeSessionId"]);
      const activeSessionId = result.activeSessionId;
      console.log("Active session ID:", activeSessionId);

      if (activeSessionId) {
        try {
          const response = await fetch("https://leetcode.com/session/", {
            method: "PUT",
            // NOTE: These headers are a little fragile. I've only tested these by hand.
            headers: {
              "Content-Type": "application/json",
              accept: "application/json, text/javascript, */*; q=0.01",
              origin: "https://leetcode.com",
              referer: "https://leetcode.com/session/",
              "x-requested-with": "XMLHttpRequest",
            },
            body: JSON.stringify({ func: "activate", target: activeSessionId }),
          });
          const data = await response.json();
          console.log("Activated session:", data);
        } catch (error) {
          console.log("Error activating session:", error);
        }
      } else {
        console.log("No active session ID available.");
      }
    }
    return { requestHeaders: details.requestHeaders };
  },
  { urls: ["*://leetcode.com/problems/*/submit/*"] },
  ["requestHeaders", "extraHeaders"]
);