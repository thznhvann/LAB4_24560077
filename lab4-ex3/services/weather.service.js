const axios = require('axios');
const https = require('https');

const REQUEST_TIMEOUT = 15000;
const httpsAgent = new https.Agent({ family: 4 });

async function getCoordinatesForCity(city) {
    const response = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
        params: { name: city, count: 1 },
        timeout: REQUEST_TIMEOUT,
        httpsAgent
    });
    const result = response.data.results && response.data.results[0];
    if (!result) {
        const err = new Error(`City "${city}" was not found`);
        err.status = 404;
        throw err;
    }
    return { latitude: result.latitude, longitude: result.longitude, resolvedName: result.name };
}

async function fetchWeatherOnce(city) {
    const { latitude, longitude, resolvedName } = await getCoordinatesForCity(city);
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: { latitude, longitude, current_weather: true },
        timeout: REQUEST_TIMEOUT,
        httpsAgent
    });
    const current = response.data.current_weather;
    return {
        city: resolvedName,
        temperatureC: current.temperature,
        windSpeedKmh: current.windspeed,
        observedAt: current.time
    };
}

async function getCurrentWeather(city) {
    try {
        return await fetchWeatherOnce(city);
    } catch (error) {
        if (error.status === 404) {
            throw error;
        }
        console.log(`External API failed for "${city}", retrying once...`);
        return await fetchWeatherOnce(city);
    }
}

module.exports = { getCurrentWeather };