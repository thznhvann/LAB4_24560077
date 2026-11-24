const { getCurrentWeather } = require('../services/weather.service');

const weatherCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

exports.getWeather = async (req, res, next) => {
    try {
        const { city } = req.query;
        if (!city) {
            return res.status(400).json({ success: false, message: 'The city query parameter is required' });
        }

        const cacheKey = city.trim().toLowerCase();
        const cached = weatherCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
            console.log(`Cache hit for city: ${city}`);
            return res.status(200).json({ success: true, data: cached.data });
        }

        const start = Date.now();
        const weather = await getCurrentWeather(city);
        const duration = Date.now() - start;
        console.log(`External API call for "${city}" took ${duration}ms`);

        weatherCache.set(cacheKey, { data: weather, timestamp: Date.now() });

        res.status(200).json({ success: true, data: weather });
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            return res.status(504).json({
                success: false,
                message: 'The weather service is taking too long to respond. Please try again in a moment.'
            });
        }
        if (error.status === 404) {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};