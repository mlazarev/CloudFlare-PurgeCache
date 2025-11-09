// CloudFlare API Configuration
// Copy this file to config.js and fill in your actual credentials

const CONFIG = {
  // Your CloudFlare Zone ID
  // Find this in your CloudFlare dashboard under the "API" section
  zoneId: 'YOUR_ZONE_ID_HERE',

  // Your CloudFlare API Token with Cache Purge permissions
  // Create one at: https://dash.cloudflare.com/profile/api-tokens
  // Make sure it also has the required Rulesets/WAF permissions (see README)
  apiToken: 'YOUR_API_TOKEN_HERE',

  // API endpoint (replace YOUR_ZONE_ID_HERE with your actual zone ID)
  apiEndpoint: 'https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID_HERE/purge_cache',

  // Description used to look up the custom rule that should always allow you through
  allowRuleDescription: 'Allow my own Access',

  // Endpoint used to detect your current public IP (should return JSON { ip: "x.x.x.x" })
  ipLookupUrl: 'https://api.ipify.org?format=json'
};
