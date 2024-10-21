document.addEventListener("DOMContentLoaded", async function () {
  try {
    const result = await chrome.storage.local.get("activeSessionId");
    const activeSessionId = result.activeSessionId;
    await fetchSessionsAndPopulateDropdown(activeSessionId);
  } catch (error) {
    console.error("Error initializing popup:", error);
  }
});

async function fetchSessionsAndPopulateDropdown(selectedSessionId) {
  try {
    const response = await fetch("https://leetcode.com/session/", {
      method: "POST",
      // NOTE: These headers are a little fragile. I've only tested these by hand.
      headers: {
        authority: "leetcode.com",
        accept: "application/json, text/javascript, */*; q=0.01",
        "cache-control": "no-cache",
        "content-type": "application/json",
        origin: "https://leetcode.com",
        pragma: "no-cache",
        referer: "https://leetcode.com/session/",
        "x-requested-with": "XMLHttpRequest",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const dropdown = document.getElementById("sessionDropdown");
    data.sessions.forEach((session) => {
      const option = document.createElement("option");
      option.value = session.id;
      option.textContent = session.name;
      console.log(session.id.toString(), selectedSessionId);
      if (session.id.toString() === selectedSessionId) {
        option.selected = true;
      }
      dropdown.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
  }
}

document.getElementById("submitBtn").addEventListener("click", async function () {
  try {
    const selectedSessionId = document.getElementById("sessionDropdown").value;
    console.log("Selected session ID:", selectedSessionId);

    await chrome.storage.local.set({ 
      activeSessionId: selectedSessionId,
      sessionChanged: true 
    });

    const successMessageDiv = document.getElementById("successMessage");
    successMessageDiv.textContent = "Success: Preferences saved!";
    successMessageDiv.style.display = "block";

    setTimeout(function () {
      successMessageDiv.style.display = "none";
    }, 3000);
  } catch (error) {
    console.error("Error saving preferences:", error);
  }
});