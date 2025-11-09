# CloudFlare Cache Purge - Chrome Extension

A Chrome browser extension that allows you to purge the CloudFlare cache for the currently visited URL with a single click.

## Features

- One-click cache purging for the current tab's URL
- Real-time status updates
- Clean, modern UI
- Uses CloudFlare API v4

## Installation

### Clone the Repository

```bash
git clone <your-repository-url>
cd PurgeCache
```

## Setup Instructions

### 1. Configure CloudFlare Credentials

Copy the example config file and add your credentials:

```bash
cp config.example.js config.js
```

Then edit `config.js` and replace the placeholder values with your actual CloudFlare credentials:

- **zoneId**: Your CloudFlare zone ID
- **apiToken**: Your CloudFlare API token (needs cache purge **and** ruleset permissions, see below)
- **apiEndpoint**: Update the zone ID in the URL to match your zone ID
- **allowRuleDescription**: The description text of the CloudFlare custom rule the extension should manage (defaults to `Allow my own Access`)
- **ipLookupUrl**: Optional public IP detection endpoint (defaults to `https://api.ipify.org?format=json`)

### Required CloudFlare token permissions

The extension now reads and updates a custom firewall rule, so the token must include both cache and ruleset scopes. The following setup has been validated:

**Required permissions**
- Account WAF:Edit (covers all ruleset read/write actions needed for the Allow/Block flows)
- All zones → Cache Purge:Purge (needed for the primary cache purge feature)

**IMPORTANT**: The `config.js` file is excluded from version control to protect your credentials.

### 2. Generate Icons

The extension requires icon files in three sizes (16x16, 48x48, 128x128). You can generate them from the included SVG:

```bash
npm install
npm run generate-icons
```

This will create `icon16.png`, `icon48.png`, and `icon128.png` files.

**Alternative**: If you prefer, you can create your own icon files manually and name them accordingly.

### 3. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right corner)
3. Click "Load unpacked"
4. Select the `PurgeCache` directory
5. The extension should now appear in your extensions list

### 4. Pin the Extension (Optional)

1. Click the puzzle piece icon in Chrome's toolbar
2. Find "CloudFlare Cache Purge" in the list
3. Click the pin icon to keep it visible in your toolbar

## Usage

1. Navigate to any URL on your CloudFlare-enabled website
2. Click the CloudFlare Cache Purge extension icon
3. The popup will display the current URL
4. Click the "Purge Cache" button
5. Wait for the success message
6. Click "Allow My Access" to detect your current public IP and update/enable the matching CloudFlare custom rule so you are always allowed through your firewall
7. Use "Block Access" to temporarily disable that allow rule (useful when you want to remove the exception without editing CloudFlare manually)

## Configuration

The CloudFlare credentials are stored in `config.js` (which is excluded from version control):

- **Zone ID**: Your CloudFlare zone ID
- **API Token**: Your CloudFlare API token with cache purge **and CloudFlare Ruleset** permissions (see "Required CloudFlare token permissions")
- **API Endpoint**: The CloudFlare API URL (includes your zone ID)

### Getting Your CloudFlare Credentials

- **Zone ID**: Found in your CloudFlare dashboard under the "API" section (this is the only credential you need besides the API token)

### Creating an API Token

CloudFlare offers two types of API tokens. Choose the one that fits your needs:

#### Option 1: User API Token (Recommended for personal use)

Create a token associated with your user profile:

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Set permissions to include "Cache Purge"
4. Save the token

**Use this option when**: You're using the extension personally and want the token tied to your user account.

#### Option 2: Account API Token (Recommended for service/team use)

Create a token at the account level:

1. Go to your CloudFlare account settings
2. Navigate to API Tokens under the account section
3. Click "Create Token"
4. Set permissions to include "Cache Purge"
5. Save the token

**Use this option when**: You prefer service tokens that are not associated with individual users and your desired API endpoints are compatible. This is ideal for shared tools, automation, or when you want tokens that persist independently of user accounts.

#### Key Differences

- **User API Tokens**: Tied to your user profile, revoked if user access changes
- **Account API Tokens**: Not tied to individual users, better for service accounts and automation

### Updating Credentials

To change your credentials, edit the `config.js` file and update the values in the `CONFIG` object.

## Security Note

**IMPORTANT**: Your credentials are now safely stored in `config.js` which is excluded from version control.

- The `config.js` file is listed in `.gitignore` and will NOT be committed to the repository
- Only `config.example.js` (with placeholder values) is tracked in version control
- Never commit actual API tokens to a public repository
- The API token should be restricted to only have "Cache Purge" permissions in CloudFlare

## Project Structure

- `manifest.json` - Extension configuration
- `popup.html` - Extension popup UI
- `popup.js` - Cache purging logic and API integration
- `popup.css` - Styling
- `config.js` - CloudFlare credentials (excluded from git, created from config.example.js)
- `config.example.js` - Template config file with placeholder values (tracked in git)
- `icon.svg` - Source icon file (vector format)
- `generate-icons.js` - Icon generation script
- `package.json` - Node.js dependencies
- `.gitignore` - Git ignore rules (excludes config.js, generated icons, and node_modules)
- `README.md` - This file

## Troubleshooting

**Extension won't load**:
- Make sure all icon files are present (icon16.png, icon48.png, icon128.png)
- Verify that `config.js` exists (copy from `config.example.js` if missing)

**Purge fails**: Verify that:
- Your API token is valid and active
- The `config.js` file has your correct credentials
- The URL is part of your CloudFlare zone
- You have cache purge permissions for the zone

**CONFIG is not defined error**: Make sure `config.js` exists and is loaded before `popup.js` in `popup.html`

**CORS errors**: The extension has proper permissions set in manifest.json for the CloudFlare API

## Development

### Prerequisites

- Node.js and npm (for generating icons)
- Git
- Google Chrome browser

### Making Changes

1. Make your changes to the source files
2. Test the extension by reloading it in Chrome (`chrome://extensions/` > Reload button)
3. If you modify `icon.svg`, regenerate the PNG icons:
   ```bash
   npm run generate-icons
   ```

### Version Control

The following files are excluded from version control (.gitignore):
- `config.js` - Contains your actual credentials (must be created from `config.example.js`)
- Generated icon PNG files - `icon16.png`, `icon48.png`, `icon128.png`
- `node_modules/` directory

After cloning the repository, you must:
1. Create `config.js` from `config.example.js` and add your credentials
2. Run `npm install` and `npm run generate-icons` to create the icon files

### Contributing

When contributing to this project:

1. Create a new branch for your feature/fix
2. Make your changes
3. Test thoroughly in Chrome
4. Commit your changes with clear commit messages
5. Push and create a pull request

**Remember**: Never commit actual API tokens or sensitive credentials to the repository.

## API Documentation

[CloudFlare Purge Cache API](https://developers.cloudflare.com/api/resources/cache/methods/purge/#purge-cached-content-by-url)

## License

This project is open source and available for personal and commercial use.
