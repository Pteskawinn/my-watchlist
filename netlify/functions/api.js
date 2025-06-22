const fetch = require('node-fetch');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

exports.handler = async function(event, context) {
    const query = event.queryStringParameters.query;
    const type = event.queryStringParameters.type;

    let url = '';

    try {
        switch (type) {
            case 'movie':
                url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${query}&language=en-US&page=1&include_adult=false`;
                break;
            case 'series':
                url = `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${query}&language=en-US&page=1&include_adult=false`;
                break;
            case 'anime':
                url = `${JIKAN_BASE_URL}/anime?q=${query}&limit=10`;
                break;
            case 'manga':
            case 'manhwa':
            case 'book': // Jikan manga endpoint can be a proxy for these
                url = `${JIKAN_BASE_URL}/manga?q=${query}&limit=10`;
                break;
            default:
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: 'Invalid type specified' })
                };
        }

        const response = await fetch(url);
        if (!response.ok) {
            // Passthrough the error from the external API
            return { 
                statusCode: response.status, 
                body: await response.text() 
            };
        }
        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error('Error in API proxy:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' })
        };
    }
}; 