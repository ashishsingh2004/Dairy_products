import React, { useState, useEffect } from 'react';
import './WeatherWidget.css';

const WeatherWidget = () => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [location, setLocation] = useState('Delhi, IN');

    const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY || 'demo';
    const DEFAULT_CITY = process.env.REACT_APP_DEFAULT_CITY || 'Delhi';

    const fetchWeatherByCoords = async (lat, lon) => {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
            );

            if (!response.ok) {
                throw new Error('Weather data not available');
            }

            const data = await response.json();
            setWeather(data);
            setLocation(`${data.name}, ${data.sys.country}`);
            setLoading(false);
            setError(null);
        } catch (err) {
            console.error('Weather fetch error:', err);
            setError('Unable to fetch weather');
            setLoading(false);
        }
    };

    const fetchWeatherByCity = async (city) => {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city},IN&units=metric&appid=${API_KEY}`
            );

            if (!response.ok) {
                throw new Error('Weather data not available');
            }

            const data = await response.json();
            setWeather(data);
            setLocation(`${data.name}, ${data.sys.country}`);
            setLoading(false);
            setError(null);
        } catch (err) {
            console.error('Weather fetch error:', err);
            setError('Unable to fetch weather');
            setLoading(false);
        }
    };

    const getWeatherIcon = (weatherCode) => {
        // Map OpenWeatherMap weather codes to emojis
        const iconMap = {
            '01d': '☀️', '01n': '🌙',
            '02d': '⛅', '02n': '☁️',
            '03d': '☁️', '03n': '☁️',
            '04d': '☁️', '04n': '☁️',
            '09d': '🌧️', '09n': '🌧️',
            '10d': '🌦️', '10n': '🌧️',
            '11d': '⛈️', '11n': '⛈️',
            '13d': '❄️', '13n': '❄️',
            '50d': '🌫️', '50n': '🌫️'
        };
        return iconMap[weatherCode] || '🌤️';
    };

    useEffect(() => {
        const fetchWeather = () => {
            // Try to get user's location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        fetchWeatherByCoords(
                            position.coords.latitude,
                            position.coords.longitude
                        );
                    },
                    (error) => {
                        console.log('Geolocation denied, using default city:', DEFAULT_CITY);
                        fetchWeatherByCity(DEFAULT_CITY);
                    }
                );
            } else {
                fetchWeatherByCity(DEFAULT_CITY);
            }
        };

        fetchWeather();

        // Refresh weather every 10 minutes
        const interval = setInterval(fetchWeather, 600000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return (
            <div className="weather-widget loading">
                <div className="weather-spinner">⏳</div>
                <p>Loading weather...</p>
            </div>
        );
    }

    if (error || !weather) {
        return (
            <div className="weather-widget error">
                <div className="weather-icon">🌤️</div>
                <p>{error || 'Weather unavailable'}</p>
            </div>
        );
    }

    return (
        <div className="weather-widget">
            <div className="weather-header">
                <span className="weather-icon-large">
                    {getWeatherIcon(weather.weather[0].icon)}
                </span>
            </div>
            <div className="weather-info">
                <div className="weather-temp">{Math.round(weather.main.temp)}°C</div>
                <div className="weather-desc">{weather.weather[0].main}</div>
                <div className="weather-location">📍 {location}</div>
            </div>
            <div className="weather-details">
                <div className="weather-detail">
                    <span>💧</span>
                    <span>{weather.main.humidity}%</span>
                </div>
                <div className="weather-detail">
                    <span>💨</span>
                    <span>{Math.round(weather.wind.speed)} km/h</span>
                </div>
            </div>
        </div>
    );
};

export default WeatherWidget;
