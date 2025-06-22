const fetch = require('node-fetch');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

exports.handler = async function(event, context) {
    const query = event.queryStringParameters.query;

    if (!query) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Query parameter is required' })
        };
    }

    const encodedQuery = encodeURIComponent(query);

    const urls = {
        movies: `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodedQuery}&language=en-US&page=1&include_adult=false`,
        series: `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodedQuery}&language=en-US&page=1&include_adult=false`,
        anime: `${JIKAN_BASE_URL}/anime?q=${encodedQuery}&limit=10`,
        manga: `${JIKAN_BASE_URL}/manga?q=${encodedQuery}&limit=10`
    };

    const fetchPromises = Object.entries(urls).map(([key, url]) => 
        fetch(url).then(response => {
            if (!response.ok) return Promise.reject(`API for ${key} failed`);
            return response.json();
        }).then(data => ({ key, data }))
    );

    try {
        const results = await Promise.allSettled(fetchPromises);
        
        const combinedData = {
            movies: { results: [] },
            series: { results: [] },
            anime: { data: [] },
            manga: { data: [] }
        };

        results.forEach(result => {
            if (result.status === 'fulfilled') {
                const { key, data } = result.value;
                combinedData[key] = data;
            } else {
                console.warn(`Failed to fetch from one of the APIs:`, result.reason);
            }
        });

        return {
            statusCode: 200,
            body: JSON.stringify(combinedData)
        };

    } catch (error) {
        console.error('Error in API proxy:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' })
        };
    }
}; 