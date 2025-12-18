document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-btn');
  const outputContainer = document.getElementById('output-container');
  const codeOutput = document.getElementById('code-output');
  const copyBtn = document.getElementById('copy-btn');
  const statusMsg = document.getElementById('status-msg');

  // 1. Check storage for captured code
  chrome.storage.local.get(['capturedCode'], (result) => {
    if (result.capturedCode) {
      codeOutput.value = result.capturedCode;
      outputContainer.style.display = 'flex';
      // Optional: Clear storage after reading so next time it's fresh?
      // User said: "reopen it to see the result".
      // If they close and reopen, they probably still want to see it until they start a new inspection.
      // So we keep it until a new inspection starts.
    }
  });

  // 2. Start Inspecting
  startBtn.addEventListener('click', () => {
    // Clear previous capture
    chrome.storage.local.remove('capturedCode', () => {
      // Send message to active tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          // If the content script is not injected yet (e.g. reload), chrome might error.
          // But manifest injects it on all_urls.
          // We can also try scripting.executeScript if message fails, but for MVP message is standard.

          chrome.tabs.sendMessage(tabs[0].id, { action: "toggle_inspect" })
            .catch(err => {
              // Fallback: If content script is not ready/listening
              console.error("Could not send message:", err);
              // Maybe inject content script manually if needed?
              // For MVP, we assume manifest injection works.
            });

          window.close(); // Close the popup
        }
      });
    });
  });

  // 3. Copy to Clipboard
  copyBtn.addEventListener('click', () => {
    if (!codeOutput.value) return;

    navigator.clipboard.writeText(codeOutput.value).then(() => {
      statusMsg.style.opacity = '1';
      setTimeout(() => {
        statusMsg.style.opacity = '0';
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  });
});
