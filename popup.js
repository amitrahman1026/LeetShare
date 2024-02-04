document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.local.get("activeSessionId", function (result) {
    const activeSessionId = result.activeSessionId;

    fetchSessionsAndPopulateDropdown(activeSessionId);
  });
});

function fetchSessionsAndPopulateDropdown(selectedSessionId) {
  fetch("https://leetcode.com/session/", {
    method: "POST",
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
      "x-requested-with": "XMLHttpRequest",
    },
    body: JSON.stringify({}),
  })
    .then((response) => response.json())
    .then((data) => {
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
    })
    .catch((error) => console.error("Error fetching sessions:", error));
}

document.getElementById("submitBtn").addEventListener("click", function () {
  const selectedSessionId = document.getElementById("sessionDropdown").value;
  console.log("Selected session ID:", selectedSessionId);

  chrome.storage.local.set({ activeSessionId: selectedSessionId }, function () {
    const successMessageDiv = document.getElementById("successMessage");
    successMessageDiv.textContent = "Success: Preferences saved!";
    successMessageDiv.style.display = "block";

    setTimeout(function () {
      successMessageDiv.style.display = "none";
    }, 3000);
  });
});
