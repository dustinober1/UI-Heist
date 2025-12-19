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
    }
  });

  // 2. Start Inspecting
  startBtn.addEventListener('click', () => {
    // Clear previous capture
    chrome.storage.local.remove('capturedCode', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const tab = tabs[0];
        if (!tab) return;

        try {
          // Inject CSS
          await chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            files: ['styles.css']
          });

          // Inject JS
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['utils.js', 'content.js']
          });

          // Send message to toggle inspection
          chrome.tabs.sendMessage(tab.id, { action: "toggle_inspect" });
          
          window.close();
        } catch (err) {
          console.error("Failed to inject or communicate:", err);
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