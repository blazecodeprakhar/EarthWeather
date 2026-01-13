// ===== Global State =====
let currentWeatherData = null;

// ===== API Configuration =====
// WAQI (World Air Quality Index) API - Get your free token from: https://aqicn.org/data-platform/token/


// ===== DOM Elements =====
const elements = {
    // Tabs
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),

    // Buttons
    detectLocationBtn: document.getElementById('detectLocationBtn'),
    searchBtn: document.getElementById('searchBtn'),

    // Inputs
    locationInput: document.getElementById('locationInput'),
    suggestions: document.getElementById('suggestions'),

    // Display sections
    loading: document.getElementById('loading'),
    errorMessage: document.getElementById('errorMessage'),
    weatherDisplay: document.getElementById('weatherDisplay'),

    // Weather data
    locationName: document.getElementById('locationName'),
    locationCoords: document.getElementById('locationCoords'),
    countryBadge: document.getElementById('countryBadge'),
    dayNightBadge: document.getElementById('dayNightBadge'),
    localTime: document.getElementById('localTime'),
    weatherDescription: document.getElementById('weatherDescription'),
    currentTemp: document.getElementById('currentTemp'),
    weatherIcon: document.getElementById('weatherIcon'),
    feelsLike: document.getElementById('feelsLike'),
    windSpeed: document.getElementById('windSpeed'),
    humidity: document.getElementById('humidity'),
    precipitation: document.getElementById('precipitation'),
    pressure: document.getElementById('pressure'),
    uvIndex: document.getElementById('uvIndex'),
    aqi: document.getElementById('aqi'),
    sunrise: document.getElementById('sunrise'),
    sunset: document.getElementById('sunset'),
    hourlyForecast: document.getElementById('hourlyForecast'),
    dailyForecast: document.getElementById('dailyForecast'),

    // Time
    currentTime: document.getElementById('currentTime')
};

// ===== Initialize App =====
function init() {
    setupEventListeners();
    updateTime();
    setInterval(updateTime, 1000);

    // Auto-detect location on load
    setTimeout(() => {
        detectLocation();
    }, 500);
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Tab switching
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Location detection
    elements.detectLocationBtn.addEventListener('click', detectLocation);

    // Manual search
    elements.searchBtn.addEventListener('click', searchLocation);
    elements.locationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchLocation();
    });

    // Autocomplete suggestions
    let debounceTimer;
    elements.locationInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();

        if (query.length < 2) {
            hideSuggestions();
            return;
        }

        debounceTimer = setTimeout(() => {
            fetchSuggestions(query);
        }, 300); // Wait 300ms after user stops typing
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box') && !e.target.closest('.suggestions')) {
            hideSuggestions();
        }
    });
}

// ===== Tab Switching =====
function switchTab(tabName) {
    elements.tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    elements.tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}Tab`);
    });
}

// ===== Time Update =====
function updateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    elements.currentTime.textContent = now.toLocaleDateString('en-US', options);
}

// ===== UI State Management =====
function showLoading() {
    elements.loading.classList.add('active');
    elements.errorMessage.classList.remove('active');
    elements.weatherDisplay.classList.remove('active');
}

function hideLoading() {
    elements.loading.classList.remove('active');
}

function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.classList.add('active');
    elements.weatherDisplay.classList.remove('active');
    hideLoading();
}

function showWeather() {
    elements.errorMessage.classList.remove('active');
    elements.weatherDisplay.classList.add('active');
    hideLoading();
}

// ===== Location Detection =====
async function detectLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }

    showLoading();

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            await fetchWeatherData(latitude, longitude);
        },
        (error) => {
            let errorMsg = 'Unable to retrieve your location';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg = 'Location permission denied. Please enable location access.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg = 'Location information is unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMsg = 'Location request timed out.';
                    break;
            }
            showError(errorMsg);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// ===== Manual Location Search =====
async function searchLocation() {
    const query = elements.locationInput.value.trim();

    if (!query) {
        showError('Please enter a location');
        return;
    }

    showLoading();

    try {
        // Use Open-Meteo Geocoding API
        const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
        const response = await fetch(geocodeUrl);
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            showError('Location not found. Please try a different search.');
            return;
        }

        const location = data.results[0];
        await fetchWeatherData(location.latitude, location.longitude, location.name, location.country);
    } catch (error) {
        console.error('Geocoding error:', error);
        showError('Failed to search location. Please try again.');
    }
}

// ===== Fetch Weather Data =====
async function fetchWeatherData(lat, lon, cityName = null, country = null) {
    try {
        // Open-Meteo API URL with all required parameters
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,surface_pressure,uv_index,is_day&hourly=temperature_2m,precipitation_probability,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset,uv_index_max&timezone=auto`;

        // Open-Meteo Air Quality API (Free, no token required)
        const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`;

        // Fetch weather data first (Critical)
        const weatherResponse = await fetch(weatherUrl);
        if (!weatherResponse.ok) {
            throw new Error(`Weather API Error: ${weatherResponse.status} ${weatherResponse.statusText}`);
        }
        const data = await weatherResponse.json();

        // Fetch AQI data (Optional - treat failure as non-fatal)
        let aqiData = null;
        try {
            const aqiResponse = await fetch(aqiUrl);
            if (aqiResponse.ok) {
                aqiData = await aqiResponse.json();
            } else {
                console.warn(`AQI API Error: ${aqiResponse.status} ${aqiResponse.statusText}`);
            }
        } catch (aqiError) {
            console.warn('AQI Fetch failed:', aqiError);
        }

        if (!data.current) {
            showError('Unable to fetch weather data');
            return;
        }

        currentWeatherData = data;

        // Get location name if not provided
        if (!cityName) {
            const locationName = await getLocationName(lat, lon);
            cityName = locationName.city;
            country = locationName.country;
        }

        displayWeatherData(data, aqiData, lat, lon, cityName, country);
        showWeather();
    } catch (error) {
        console.error('Weather fetch error:', error);
        showError('Failed to fetch weather data. Please try again.');
    }
}

// ===== Get Location Name from Coordinates =====
async function getLocationName(lat, lon) {
    try {
        // Try reverse geocoding with Open-Meteo
        const url = `https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&count=1&language=en&format=json`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            return {
                city: data.results[0].name,
                country: data.results[0].country
            };
        }
    } catch (error) {
        console.error('Reverse geocoding error:', error);
    }

    // Fallback: Show approximate location based on coordinates
    const latDirection = lat >= 0 ? 'N' : 'S';
    const lonDirection = lon >= 0 ? 'E' : 'W';
    const approximateLocation = `Location: ${Math.abs(lat).toFixed(2)}°${latDirection}, ${Math.abs(lon).toFixed(2)}°${lonDirection}`;

    return {
        city: approximateLocation,
        country: ''
    };
}

// ===== Display Weather Data =====
function displayWeatherData(data, aqiData, lat, lon, cityName, country) {
    const { current, hourly, daily, timezone } = data;

    // Location name (city only)
    elements.locationName.textContent = cityName;

    // Country badge
    if (country) {
        elements.countryBadge.textContent = `🌍 ${country}`;
    } else {
        elements.countryBadge.textContent = '🌍 Global';
    }

    // Day/Night indicator
    const isDaytime = current.is_day === 1;
    elements.dayNightBadge.textContent = isDaytime ? '☀️ Day' : '🌙 Night';

    // Location coordinates
    elements.locationCoords.textContent = `📍 ${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;

    // Local time
    const localTime = new Date().toLocaleString('en-US', {
        timeZone: timezone || 'UTC',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    elements.localTime.textContent = `🕐 ${localTime}`;

    // Weather description
    elements.weatherDescription.textContent = getWeatherDescription(current.weather_code);

    // Current weather
    elements.currentTemp.textContent = Math.round(current.temperature_2m);
    elements.feelsLike.textContent = `${Math.round(current.apparent_temperature)}°C`;
    elements.windSpeed.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    elements.humidity.textContent = `${current.relative_humidity_2m}%`;
    elements.precipitation.textContent = `${current.precipitation} mm`;
    elements.pressure.textContent = `${Math.round(current.surface_pressure)} hPa`;
    elements.uvIndex.textContent = current.uv_index !== undefined ? current.uv_index.toFixed(1) : 'N/A';

    // Air Quality Index from Open-Meteo API
    if (aqiData && aqiData.current) {
        const aqiValue = aqiData.current.us_aqi;
        const aqiCategory = getAQICategory(aqiValue);

        elements.aqi.textContent = `${aqiValue} (${aqiCategory})`;
        elements.aqi.title = `PM2.5: ${aqiData.current.pm2_5} | PM10: ${aqiData.current.pm10} | O₃: ${aqiData.current.ozone}`;
    } else {
        elements.aqi.textContent = 'N/A';
        elements.aqi.title = 'Air quality data not available for this location';
    }

    // Sunrise/Sunset
    if (daily.sunrise && daily.sunrise[0]) {
        const sunriseTime = new Date(daily.sunrise[0]);
        elements.sunrise.textContent = sunriseTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    if (daily.sunset && daily.sunset[0]) {
        const sunsetTime = new Date(daily.sunset[0]);
        elements.sunset.textContent = sunsetTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    // Weather icon
    elements.weatherIcon.textContent = getWeatherIcon(current.weather_code, current.is_day);

    // Hourly forecast (next 24 hours)
    displayHourlyForecast(hourly);

    // Daily forecast (next 7 days)
    displayDailyForecast(daily);
}

// ===== Display Hourly Forecast =====
function displayHourlyForecast(hourly) {
    elements.hourlyForecast.innerHTML = '';

    // Show next 24 hours
    for (let i = 0; i < 24; i++) {
        const time = new Date(hourly.time[i]);
        const temp = Math.round(hourly.temperature_2m[i]);
        const weatherCode = hourly.weather_code[i];
        const precipitation = hourly.precipitation_probability[i];
        const isDay = hourly.is_day[i]; // Get day/night status

        const hourlyItem = document.createElement('div');
        hourlyItem.className = 'hourly-item';
        hourlyItem.innerHTML = `
            <div class="hourly-time">${time.getHours()}:00</div>
            <div class="hourly-icon">${getWeatherIcon(weatherCode, isDay)}</div>
            <div class="hourly-temp">${temp}°C</div>
            ${precipitation > 0 ? `<div class="hourly-precipitation">${precipitation}%</div>` : ''}
        `;

        elements.hourlyForecast.appendChild(hourlyItem);
    }
}

// ===== Display Daily Forecast =====
function displayDailyForecast(daily) {
    elements.dailyForecast.innerHTML = '';

    // Show next 7 days
    for (let i = 0; i < 7; i++) {
        const date = new Date(daily.time[i]);
        const tempMax = Math.round(daily.temperature_2m_max[i]);
        const tempMin = Math.round(daily.temperature_2m_min[i]);
        const weatherCode = daily.weather_code[i];
        const precipitation = daily.precipitation_sum[i];

        const dayName = i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        const dailyItem = document.createElement('div');
        dailyItem.className = 'daily-item';
        dailyItem.innerHTML = `
            <div class="daily-date">
                <div style="font-weight: 700;">${dayName}</div>
                <div style="font-size: 0.85rem; color: var(--text-muted);">${dateStr}</div>
            </div>
            <div class="daily-icon">${getWeatherIcon(weatherCode)}</div>
            <div class="daily-temp-range">
                <span class="temp-max">${tempMax}°</span>
                <span class="temp-min">${tempMin}°</span>
            </div>
            ${precipitation > 0 ? `<div class="daily-precipitation">💧 ${precipitation.toFixed(1)}mm</div>` : '<div class="daily-precipitation">No rain</div>'}
        `;

        elements.dailyForecast.appendChild(dailyItem);
    }
}

// ===== Weather Code to Icon Mapping =====
function getWeatherIcon(code, isDay) {
    // Default to day if isDay is not provided or not 0
    // Open-Meteo returns 1 for day, 0 for night
    const isNight = isDay === 0;

    const iconMap = {
        0: '☀️',      // Clear sky
        1: '🌤️',     // Mainly clear
        2: '⛅',     // Partly cloudy
        3: '☁️',     // Overcast
        45: '🌫️',    // Foggy
        48: '🌫️',    // Depositing rime fog
        51: '🌦️',    // Light drizzle
        53: '🌦️',    // Moderate drizzle
        55: '🌧️',    // Dense drizzle
        56: '🌧️',    // Light freezing drizzle
        57: '🌧️',    // Dense freezing drizzle
        61: '🌧️',    // Slight rain
        63: '🌧️',    // Moderate rain
        65: '⛈️',     // Heavy rain
        66: '🌧️',    // Light freezing rain
        67: '🌧️',    // Heavy freezing rain
        71: '🌨️',    // Slight snow
        73: '🌨️',    // Moderate snow
        75: '❄️',     // Heavy snow
        77: '🌨️',    // Snow grains
        80: '🌦️',    // Slight rain showers
        81: '🌧️',    // Moderate rain showers
        82: '⛈️',     // Violent rain showers
        85: '🌨️',    // Slight snow showers
        86: '❄️',     // Heavy snow showers
        95: '⛈️',     // Thunderstorm
        96: '⛈️',     // Thunderstorm with slight hail
        99: '⛈️'      // Thunderstorm with heavy hail
    };

    // Handle night icons
    if (isNight) {
        // Clear or mainly clear -> Moon
        if (code === 0 || code === 1) return '🌙';
        // Partly cloudy -> Cloud
        if (code === 2) return '☁️';
        // Overcast -> Cloud
        if (code === 3) return '☁️';
    }

    return iconMap[code] || '🌤️';
}

// ===== Weather Code to Description Mapping =====
function getWeatherDescription(code) {
    const descriptionMap = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        56: 'Light freezing drizzle',
        57: 'Dense freezing drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        66: 'Light freezing rain',
        67: 'Heavy freezing rain',
        71: 'Slight snow',
        73: 'Moderate snow',
        75: 'Heavy snow',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail'
    };

    return descriptionMap[code] || 'Unknown conditions';
}



// ===== Get AQI Category (NEW) =====
function getAQICategory(aqi) {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
}

// ===== Fetch Location Suggestions =====
async function fetchSuggestions(query) {
    try {
        const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
        const response = await fetch(geocodeUrl);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            displaySuggestions(data.results);
        } else {
            hideSuggestions();
        }
    } catch (error) {
        console.error('Suggestion fetch error:', error);
        hideSuggestions();
    }
}

// ===== Display Suggestions =====
function displaySuggestions(locations) {
    elements.suggestions.innerHTML = '';

    locations.forEach(location => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';

        const name = document.createElement('div');
        name.className = 'suggestion-name';
        name.textContent = location.name;

        const details = document.createElement('div');
        details.className = 'suggestion-details';

        const country = document.createElement('span');
        country.className = 'suggestion-country';
        country.textContent = location.country || 'Unknown';

        const coords = document.createElement('span');
        coords.textContent = `${location.latitude.toFixed(2)}°, ${location.longitude.toFixed(2)}°`;

        details.appendChild(country);
        details.appendChild(document.createTextNode(' • '));
        details.appendChild(coords);

        item.appendChild(name);
        item.appendChild(details);

        // Click handler
        item.addEventListener('click', () => selectSuggestion(location));

        elements.suggestions.appendChild(item);
    });

    elements.suggestions.classList.add('active');
}

// ===== Select Suggestion =====
function selectSuggestion(location) {
    elements.locationInput.value = location.name;
    hideSuggestions();
    fetchWeatherData(location.latitude, location.longitude, location.name, location.country);
}

// ===== Hide Suggestions =====
function hideSuggestions() {
    elements.suggestions.classList.remove('active');
    elements.suggestions.innerHTML = '';
}


// ===== Initialize on DOM Load =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
