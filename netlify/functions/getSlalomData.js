// This is a Netlify Function. It runs on the server, not in the browser.
// It acts as a secure proxy to the real API.

// We need to use a fetch library that works in a Node.js environment.
const fetch = require('node-fetch');

// --- Configuration from the API Guide ---
const runsApiUrl = 'https://web-production-dc5de.up.railway.app/api/runsAUS/?year=2025';
const loginApiUrl = 'https://web-production-dc5de.up.railway.app/api/auth/login/';

// IMPORTANT: The API credentials are now stored securely as environment variables in Netlify.
const apiUsername = process.env.API_USERNAME;
const apiPassword = process.env.API_PASSWORD;
// -----------------------------------------

/**
 * This function authenticates with the API to get a fresh, valid token.
 */
async function getNewToken() {
    const response = await fetch(loginApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: apiUsername,
            password: apiPassword,
        }),
    });

    if (!response.ok) {
        throw new Error(`Authentication failed with status: ${response.status}`);
    }

    const loginData = await response.json();
    
    // The API documentation implies the token is in a 'token' field.
    // Adjust if the actual field name is different (e.g., 'access_token').
    if (!loginData.token) {
        throw new Error('Token not found in login response.');
    }
    
    return loginData.token;
}


exports.handler = async function(event, context) {
    try {
        // Step 1: Get a fresh token on every request.
        const freshToken = await getNewToken();

        // Step 2: Use the new token to fetch the slalom data.
        const response = await fetch(runsApiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${freshToken}`
            }
        });

        if (!response.ok) {
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `API request failed: ${response.statusText}` })
            };
        }

        const data = await response.json();

        // Step 3: Return the data to the front-end.
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error('Error in Netlify function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || 'An internal server error occurred.' })
        };
    }
};
