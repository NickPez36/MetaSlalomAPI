// This is a Netlify Function. It runs on the server, not in the browser.
// It acts as a secure proxy to the real API.

// We need to use a fetch library that works in a Node.js environment.
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // --- Configuration from the API Guide ---
    const apiUrl = 'https://web-production-dc5de.up.railway.app/api/runsAUS/?year=2025';
    
    // IMPORTANT: We are now using the new static API token provided by the developer.
    // It is stored securely as an environment variable in Netlify.
    const apiToken = process.env.STATIC_API_TOKEN;
    // -----------------------------------------

    // Check if the token was found in the environment variables.
    if (!apiToken) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'API token is not configured in Netlify.' })
        };
    }

    try {
        // Use the static token to fetch the slalom data directly.
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${apiToken}`
            }
        });

        if (!response.ok) {
            // If the API returns an error, pass it back to the front-end.
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `API request failed: ${response.statusText}` })
            };
        }

        const data = await response.json();

        // If successful, return the data to the front-end.
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
