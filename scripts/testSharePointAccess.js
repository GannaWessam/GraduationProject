/**
 * SharePoint Access Test Script
 * 
 * This script tests if we can access SharePoint files using Microsoft Graph API
 * 
 * Prerequisites:
 * 1. Azure AD App Registration (see SETUP_INSTRUCTIONS.md)
 * 2. Environment variables configured
 */

require('dotenv').config();
const axios = require('axios');

// Configuration
const config = {
    tenantId: process.env.AZURE_TENANT_ID || 'YOUR_TENANT_ID',
    clientId: process.env.AZURE_CLIENT_ID || 'YOUR_CLIENT_ID',
    clientSecret: process.env.AZURE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET',
    sharePointUrl: 'https://eunscu-my.sharepoint.com/:u:/g/personal/cert_cuit_scu_eg/IQDONSmyoIPjTZ2oJBGjZrUzAWVQtBI9thUvCNenJrLzp1o'
};

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(60));
    log(title, colors.bright + colors.cyan);
    console.log('='.repeat(60) + '\n');
}

function logSuccess(message) {
    log(`✓ ${message}`, colors.green);
}

function logError(message) {
    log(`✗ ${message}`, colors.red);
}

function logWarning(message) {
    log(`⚠ ${message}`, colors.yellow);
}

function logInfo(message) {
    log(`ℹ ${message}`, colors.blue);
}

/**
 * Step 1: Get Access Token from Azure AD
 */
async function getAccessToken() {
    logSection('STEP 1: Authentication with Azure AD');
    
    try {
        const tokenEndpoint = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`;
        
        logInfo(`Token Endpoint: ${tokenEndpoint}`);
        logInfo(`Client ID: ${config.clientId.substring(0, 8)}...`);
        
        const params = new URLSearchParams();
        params.append('client_id', config.clientId);
        params.append('client_secret', config.clientSecret);
        params.append('scope', 'https://graph.microsoft.com/.default');
        params.append('grant_type', 'client_credentials');
        
        const response = await axios.post(tokenEndpoint, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        logSuccess('Successfully obtained access token');
        logInfo(`Token Type: ${response.data.token_type}`);
        logInfo(`Expires In: ${response.data.expires_in} seconds`);
        logInfo(`Access Token: ${response.data.access_token.substring(0, 20)}...`);
        
        return response.data.access_token;
        
    } catch (error) {
        logError('Failed to obtain access token');
        
        if (error.response) {
            logError(`Status: ${error.response.status}`);
            logError(`Error: ${error.response.data.error}`);
            logError(`Description: ${error.response.data.error_description}`);
            
            if (error.response.data.error === 'invalid_client') {
                logWarning('\nPossible Issues:');
                console.log('  1. Client ID or Client Secret is incorrect');
                console.log('  2. Client Secret has expired');
                console.log('  3. App is not properly registered in Azure AD');
            } else if (error.response.data.error === 'unauthorized_client') {
                logWarning('\nPossible Issues:');
                console.log('  1. App does not have the required permissions');
                console.log('  2. Admin consent not granted');
            }
        } else {
            logError(`Error: ${error.message}`);
        }
        
        throw error;
    }
}

/**
 * Step 2: Parse SharePoint Sharing Link
 */
function parseSharePointUrl(url) {
    logSection('STEP 2: Parsing SharePoint URL');
    
    logInfo(`Original URL: ${url}`);
    
    // This is a sharing link format: https://tenant.sharepoint.com/:u:/g/personal/user/encoded_id
    // We need to decode it or use a different approach
    
    const urlParts = url.split('/');
    const domain = urlParts[2]; // eunscu-my.sharepoint.com
    const encodedId = urlParts[urlParts.length - 1]; // The encoded sharing ID
    
    logInfo(`Domain: ${domain}`);
    logInfo(`Encoded ID: ${encodedId}`);
    
    logWarning('Note: Sharing links require special handling');
    
    return {
        domain,
        encodedId,
        originalUrl: url
    };
}

/**
 * Step 3: Method 1 - Try to resolve sharing link
 */
async function tryResolveSharingLink(token, sharingUrl) {
    logSection('STEP 3: Method 1 - Resolve Sharing Link');
    
    try {
        // Encode the sharing URL
        const encodedUrl = Buffer.from(sharingUrl).toString('base64')
            .replace(/=+$/, '')
            .replace(/\//g, '_')
            .replace(/\+/g, '-');
        
        const shareUrl = `u!${encodedUrl}`;
        
        logInfo(`Encoded Share URL: ${shareUrl}`);
        
        const endpoint = `https://graph.microsoft.com/v1.0/shares/${shareUrl}/driveItem`;
        
        logInfo(`Calling: ${endpoint}`);
        
        const response = await axios.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        logSuccess('Successfully resolved sharing link!');
        logInfo(`Item Name: ${response.data.name}`);
        logInfo(`Item Type: ${response.data.folder ? 'Folder' : 'File'}`);
        logInfo(`Item ID: ${response.data.id}`);
        
        if (response.data.folder) {
            logInfo(`Child Count: ${response.data.folder.childCount}`);
        }
        
        return response.data;
        
    } catch (error) {
        logError('Failed to resolve sharing link');
        
        if (error.response) {
            logError(`Status: ${error.response.status}`);
            logError(`Error Code: ${error.response.data.error?.code}`);
            logError(`Message: ${error.response.data.error?.message}`);
            
            if (error.response.status === 401) {
                logWarning('\nPossible Issues:');
                console.log('  1. Token is invalid or expired');
                console.log('  2. App lacks Files.Read.All or Sites.Read.All permissions');
            } else if (error.response.status === 403) {
                logWarning('\nPossible Issues:');
                console.log('  1. App does not have permission to access this resource');
                console.log('  2. The sharing link requires user authentication (not app-only)');
                console.log('  3. Admin consent not granted for required permissions');
            } else if (error.response.status === 404) {
                logWarning('\nPossible Issues:');
                console.log('  1. The sharing link has expired or is invalid');
                console.log('  2. The resource has been deleted or moved');
            }
        } else {
            logError(`Error: ${error.message}`);
        }
        
        return null;
    }
}

/**
 * Step 4: Method 2 - Try direct site access (requires site URL)
 */
async function tryDirectSiteAccess(token, siteUrl) {
    logSection('STEP 4: Method 2 - Direct Site Access');
    
    try {
        // Extract site information
        const hostname = 'eunscu-my.sharepoint.com';
        const sitePath = '/personal/cert_cuit_scu_eg';
        
        logInfo(`Hostname: ${hostname}`);
        logInfo(`Site Path: ${sitePath}`);
        
        const endpoint = `https://graph.microsoft.com/v1.0/sites/${hostname}:${sitePath}`;
        
        logInfo(`Calling: ${endpoint}`);
        
        const response = await axios.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        logSuccess('Successfully accessed site!');
        logInfo(`Site Name: ${response.data.displayName}`);
        logInfo(`Site ID: ${response.data.id}`);
        
        return response.data;
        
    } catch (error) {
        logError('Failed to access site directly');
        
        if (error.response) {
            logError(`Status: ${error.response.status}`);
            logError(`Error Code: ${error.response.data.error?.code}`);
            logError(`Message: ${error.response.data.error?.message}`);
        } else {
            logError(`Error: ${error.message}`);
        }
        
        return null;
    }
}

/**
 * Step 5: List files in folder (if we got access)
 */
async function listFilesInFolder(token, driveId, itemId) {
    logSection('STEP 5: Listing Files in Folder');
    
    try {
        const endpoint = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/children`;
        
        logInfo(`Calling: ${endpoint}`);
        
        const response = await axios.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        logSuccess(`Found ${response.data.value.length} items`);
        
        response.data.value.forEach((item, index) => {
            const itemType = item.folder ? '[FOLDER]' : '[FILE]';
            const size = item.size ? `(${(item.size / 1024 / 1024).toFixed(2)} MB)` : '';
            console.log(`  ${index + 1}. ${itemType} ${item.name} ${size}`);
        });
        
        // Filter PDF files
        const pdfFiles = response.data.value.filter(item => 
            !item.folder && item.name.toLowerCase().endsWith('.pdf')
        );
        
        logInfo(`\nFound ${pdfFiles.length} PDF files`);
        
        return response.data.value;
        
    } catch (error) {
        logError('Failed to list files');
        
        if (error.response) {
            logError(`Status: ${error.response.status}`);
            logError(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
        } else {
            logError(`Error: ${error.message}`);
        }
        
        return null;
    }
}

/**
 * Main test function
 */
async function runTests() {
    console.log('\n');
    log('SharePoint Access Test Script', colors.bright + colors.magenta);
    log('Testing access to: ' + config.sharePointUrl, colors.cyan);
    
    // Check configuration
    logSection('Configuration Check');
    
    if (config.tenantId === 'YOUR_TENANT_ID' || 
        config.clientId === 'YOUR_CLIENT_ID' || 
        config.clientSecret === 'YOUR_CLIENT_SECRET') {
        logError('Configuration not complete!');
        logWarning('\nPlease configure the following in your .env file:');
        console.log('  AZURE_TENANT_ID=your-tenant-id');
        console.log('  AZURE_CLIENT_ID=your-client-id');
        console.log('  AZURE_CLIENT_SECRET=your-client-secret');
        console.log('\nSee SETUP_INSTRUCTIONS.md for details');
        return;
    }
    
    logSuccess('Configuration loaded');
    
    try {
        // Step 1: Get token
        const token = await getAccessToken();
        
        // Step 2: Parse URL
        const parsedUrl = parseSharePointUrl(config.sharePointUrl);
        
        // Step 3: Try to resolve sharing link
        const sharingResult = await tryResolveSharingLink(token, config.sharePointUrl);
        
        if (sharingResult) {
            // If successful, try to list files
            if (sharingResult.folder) {
                const parentReference = sharingResult.parentReference;
                await listFilesInFolder(token, parentReference.driveId, sharingResult.id);
            }
        } else {
            // Step 4: Try direct site access as fallback
            await tryDirectSiteAccess(token, parsedUrl.domain);
        }
        
        // Final summary
        logSection('SUMMARY');
        
        if (sharingResult) {
            logSuccess('SharePoint access is working!');
            console.log('\nNext steps:');
            console.log('  1. You can proceed with implementing the certificate integration');
            console.log('  2. Use the Graph API endpoints shown above in your application');
            console.log('  3. Implement file matching and download features');
        } else {
            logWarning('SharePoint access failed');
            console.log('\nPossible solutions:');
            console.log('  1. Use delegated permissions instead of application permissions');
            console.log('  2. Request the admin to share the folder with your app directly');
            console.log('  3. Consider alternative approaches (see documentation)');
            console.log('  4. Contact your IT department for assistance');
        }
        
    } catch (error) {
        logSection('TEST FAILED');
        logError('The test encountered a critical error');
        console.log('\nPlease check the error messages above and:');
        console.log('  1. Verify your Azure AD configuration');
        console.log('  2. Check that all required permissions are granted');
        console.log('  3. Ensure admin consent has been provided');
        console.log('  4. Review the SETUP_INSTRUCTIONS.md file');
    }
}

// Run the tests
if (require.main === module) {
    runTests().catch(error => {
        console.error('\nUnexpected error:', error.message);
        process.exit(1);
    });
}

module.exports = {
    getAccessToken,
    tryResolveSharingLink,
    listFilesInFolder
};
