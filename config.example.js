// CloudFlare API Configuration
// Copy this file to config.js and fill in your actual credentials

const CONFIG = {
  // Your CloudFlare Zone ID
  // Find this in your CloudFlare dashboard under the "API" section
  zoneId: 'YOUR_ZONE_ID_HERE',

  // Your CloudFlare API Token with Cache Purge permissions
  // Create one at: https://dash.cloudflare.com/profile/api-tokens
  apiToken: 'YOUR_API_TOKEN_HERE',

  // API endpoint (replace YOUR_ZONE_ID_HERE with your actual zone ID)
  apiEndpoint: 'https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID_HERE/purge_cache'
};
