// CloudFlare configuration is loaded from config.js
// CONFIG is defined in config.js and loaded via manifest.json

// Get current tab URL
async function getCurrentTabUrl() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab.url;
}

// Display the current URL
async function displayCurrentUrl() {
  const url = await getCurrentTabUrl();
  document.getElementById('currentUrl').textContent = url;
  return url;
}

// Purge CloudFlare cache
async function purgeCache(url) {
  const statusElement = document.getElementById('status');
  const purgeBtn = document.getElementById('purgeBtn');

  try {
    statusElement.textContent = 'Purging cache...';
    statusElement.className = 'status loading';
    purgeBtn.disabled = true;

    const response = await fetch(CONFIG.apiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: [url]
      })
    });

    const data = await response.json();

    if (data.success) {
      statusElement.textContent = 'Cache purged successfully!';
      statusElement.className = 'status success';
    } else {
      throw new Error(data.errors?.[0]?.message || 'Unknown error occurred');
    }
  } catch (error) {
    statusElement.textContent = `Error: ${error.message}`;
    statusElement.className = 'status error';
  } finally {
    purgeBtn.disabled = false;
  }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  // Display current URL
  const url = await displayCurrentUrl();

  // Add click handler to purge button
  document.getElementById('purgeBtn').addEventListener('click', () => {
    purgeCache(url);
  });
});
