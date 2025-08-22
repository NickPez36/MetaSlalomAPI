// This is a Netlify Function. It runs on the server, not in the browser.
// It acts as a secure proxy to the real API.

// We need to use a fetch library that works in a Node.js environment.
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // --- Configuration from the API Guide ---
    const apiUrl = 'https://web-production-dc5de.up.railway.app/api/runsAUS/?year=2025';
    
    // IMPORTANT: The API token is stored securely as an environment variable in Netlify.
    // It is never exposed to the user's browser.
    const apiToken = process.env.API_TOKEN;
    // -----------------------------------------

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                // The server-side function securely adds the authorization header.
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

        // If successful, return a 200 OK status and the data as a JSON string.
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error('Error in Netlify function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An internal server error occurred.' })
        };
    }
};
