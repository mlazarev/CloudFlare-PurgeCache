// CloudFlare configuration is loaded from config.js
// CONFIG is defined in config.js and loaded via manifest.json

const STATUS_BASE_CLASS = 'status';

function setStatus(message, state) {
  const statusElement = document.getElementById('status');
  statusElement.textContent = message;
  statusElement.className = `${STATUS_BASE_CLASS} ${state ? state : ''}`.trim();
}

function setButtonsDisabled(isDisabled) {
  ['purgeBtn', 'allowAccessBtn', 'blockAccessBtn'].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.disabled = isDisabled;
    }
  });
}

function assertConfigField(field, message) {
  if (!CONFIG[field]) {
    throw new Error(message);
  }
}

// Get current tab URL
async function getCurrentTabUrl() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.url;
}

// Display the current URL
async function displayCurrentUrl() {
  const url = await getCurrentTabUrl();
  document.getElementById('currentUrl').textContent = url || 'Unavailable';
  return url;
}

async function cfRequest(path, options = {}) {
  assertConfigField('zoneId', 'Zone ID is not configured');
  assertConfigField('apiToken', 'API token is not configured');

  const { method = 'GET', body } = options;
  const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${CONFIG.apiToken}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.errors?.[0]?.message || 'CloudFlare API error');
  }

  return data;
}

async function purgeCache() {
  const url = await displayCurrentUrl();
  if (!url) {
    setStatus('Could not determine current tab URL.', 'error');
    return;
  }

  try {
    setButtonsDisabled(true);
    setStatus('Purging cache...', 'loading');

    const response = await fetch(CONFIG.apiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ files: [url] })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.errors?.[0]?.message || 'Unknown error occurred');
    }

    setStatus('Cache purged successfully!', 'success');
  } catch (error) {
    setStatus(`Error: ${error.message}`, 'error');
  } finally {
    setButtonsDisabled(false);
  }
}

async function detectPublicIp() {
  const endpoint = CONFIG.ipLookupUrl || 'https://api.ipify.org?format=json';
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error('Failed to detect public IP address');
  }

  let ipValue;
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const data = await response.json();
    ipValue = data.ip || data.ipAddress || data.address;
  } else {
    ipValue = (await response.text()).trim();
  }

  if (!ipValue) {
    throw new Error('Public IP response was empty');
  }

  const ipv4Pattern = /^(25[0-5]|2[0-4]\d|[01]?\d?\d)(\.(25[0-5]|2[0-4]\d|[01]?\d?\d)){3}$/;
  const ipv6Pattern = /^([a-f0-9:]+:+)+[a-f0-9]+$/i;

  if (!ipv4Pattern.test(ipValue) && !ipv6Pattern.test(ipValue)) {
    throw new Error('Unexpected IP address format');
  }

  return ipValue;
}

async function findAllowRule() {
  const rulesetsData = await cfRequest(`/zones/${CONFIG.zoneId}/rulesets`);
  const customRuleset = rulesetsData.result?.find(
    (ruleset) => ruleset.kind === 'zone' && ruleset.phase === 'http_request_firewall_custom'
  );

  if (!customRuleset) {
    throw new Error('Custom firewall ruleset not found');
  }

  const rulesetDetails = await cfRequest(`/zones/${CONFIG.zoneId}/rulesets/${customRuleset.id}`);
  const description = CONFIG.allowRuleDescription || 'Allow my own Access';
  const allowRule = rulesetDetails.result?.rules?.find((rule) => rule.description === description);

  if (!allowRule) {
    throw new Error(`Rule "${description}" not found`);
  }

  return { rulesetId: customRuleset.id, rule: allowRule, description };
}

async function updateAllowRule(ipAddress) {
  const { rulesetId, rule, description } = await findAllowRule();
  const expression = `(ip.src eq ${ipAddress})`;

  await cfRequest(`/zones/${CONFIG.zoneId}/rulesets/${rulesetId}/rules/${rule.id}`, {
    method: 'PATCH',
    body: {
      description,
      expression,
      action: 'skip',
      action_parameters: { ruleset: 'current' },
      enabled: true,
      logging: { enabled: true }
    }
  });
}

async function disableAllowRule() {
  const { rulesetId, rule, description } = await findAllowRule();
  const expression = rule.expression || '(ip.src eq 0.0.0.0)';
  const actionParameters = rule.action_parameters || { ruleset: 'current' };

  await cfRequest(`/zones/${CONFIG.zoneId}/rulesets/${rulesetId}/rules/${rule.id}`, {
    method: 'PATCH',
    body: {
      description,
      expression,
      action: 'skip',
      action_parameters: actionParameters,
      enabled: false,
      logging: { enabled: true }
    }
  });
}

async function allowMyAccess() {
  try {
    setButtonsDisabled(true);
    setStatus('Detecting your public IP...', 'loading');
    const ipAddress = await detectPublicIp();

    setStatus(`Updating CloudFlare rule for ${ipAddress}...`, 'loading');
    await updateAllowRule(ipAddress);

    setStatus(`Rule updated. Access allowed for ${ipAddress}`, 'success');
  } catch (error) {
    setStatus(`Error: ${error.message}`, 'error');
  } finally {
    setButtonsDisabled(false);
  }
}

async function blockMyAccess() {
  try {
    setButtonsDisabled(true);
    setStatus('Disabling CloudFlare allow rule...', 'loading');
    await disableAllowRule();

    setStatus('Rule disabled. Your IP is no longer auto-allowed.', 'success');
  } catch (error) {
    setStatus(`Error: ${error.message}`, 'error');
  } finally {
    setButtonsDisabled(false);
  }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await displayCurrentUrl();

  document.getElementById('purgeBtn').addEventListener('click', purgeCache);
  document.getElementById('allowAccessBtn').addEventListener('click', allowMyAccess);
  document.getElementById('blockAccessBtn').addEventListener('click', blockMyAccess);
});
