<div align="center">

# 🌍 EarthWeather
### Global Weather Forecast App

A beautiful, feature-rich weather application powered by the **Open-Meteo API**.<br>
Completely free, no API key required, and privacy-focused.

![Weather App Badge](https://img.shields.io/badge/Weather-App-blue?style=for-the-badge)
![Open-Meteo Badge](https://img.shields.io/badge/API-Open--Meteo-green?style=for-the-badge)
![License Badge](https://img.shields.io/badge/License-Open%20Source-orange?style=for-the-badge)

[View Demo](#) · [Report Bug](#) · [Request Feature](#)

</div>

---

## ✨ Features

### 🎯 Core Capabilities
- **🌐 Automatic Location Detection** - Instantly retrieves weather for your current coordinates using Geolocation API.
- **🔍 Global City Search** - Smart autocomplete search for any city worldwide.
- **⚡ Real-time Updates** - Live weather data including temperature, humidity, wind speed, precipitation, and pressure.
- **🏭 Air Quality Index (AQI)** - Real-time air quality metrics (PM2.5, PM10, NO₂, O₃) with health impact categories.
- **☀️ UV Index Tracking** - Integrated UV radiation levels to help you stay safe in the sun.
- **🌅 Solar Cycle** - Accurate local sunrise and sunset times.

### 🎨 Design & Experience
- **🌙 Glassmorphism Dark Mode** - A modern, sleek dark theme with transparency effects and gradients.
- **🌊 Dynamic Animations** - Subtle floating clouds, smooth transitions, and refined interactions.
- **📱 Fully Responsive** - Optimized experience across mobile phones, tablets, and desktop screens.
- **⛔ No API Key Needed** - Clone and run immediately without any configuration or sign-ups.

## 🚀 Quick Start

Get up and running in seconds.

### Option 1: Direct Usage
Simply open `index.html` in your modern web browser.
*Note: Some browsers may restrict Geolocation on local files using the `file://` protocol. For the best experience, use a local server.*

### Option 2: Local Server (Recommended)

**Using Python:**
```bash
python -m http.server 8000
```

**Using Node.js:**
```bash
npx serve
```

Then open `http://localhost:8000` in your browser.

## 📖 How to Use

### 1️⃣ Auto Detect Location
- Click the **"Auto Detect"** tab.
- Click the **"Detect My Location"** button.
- Allow location access when prompted by your browser.

### 2️⃣ Search by City
- Click the **"Search Location"** tab.
- Type a city name (e.g., "London", "Tokyo").
- Select from the **autocomplete suggestions** or press Enter.

## 📊 Dashboard Overview

The application provides a comprehensive weather dashboard:

| Section | Data Points |
|---------|-------------|
| **Current Weather** | Temperature, Feels Like, Wind Speed, Humidity, Pressure, Precipitation |
| **Environmental** | Air Quality Index (AQI), UV Index, Dominant Pollutants |
| **Astronomy** | Local Sunrise & Sunset times |
| **Forecasts** | 24-Hour Hourly trend & 7-Day Daily outlook |

## �️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Native CSS Variables, Flexbox, Grid, Glassmorphism
- **Data Source**: [Open-Meteo API](https://open-meteo.com/) (Weather, Geocoding, Air Quality)
- **Icons**: Dynamic Emoji System

## 📂 Project Structure

```
EarthWeather/
├── index.html          # Main application structure
├── styles.css          # Styling, animations, and responsive design
├── script.js           # Business logic, API integration, and UI updates
└── README.md           # Documentation
```

## � Troubleshooting

| Issue | Possible Solution |
|-------|-------------------|
| **Location not found** | Enable location permissions in browser. Ensure you are using HTTPS or localhost. |
| **Data not loading** | Check internet connection. Verify that Open-Meteo is not blocked by your network. |
| **Search isn't working** | Try entering the full city name. Check the browser console (F12) for errors. |

## � Future Roadmap

- [ ] 🌡️ Fahrenheit/Celsius Toggle
- [ ] 🔔 Weather Alerts and Warnings
- [ ] 🗺️ Interactive Weather Maps
- [ ] 🌑 Moon Phase Cycle
- [ ] 💾 Favorite Locations System
- [ ] 📉 Historical Weather Data

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch
3. Commit your Changes
4. Push to the Branch
5. Open a Pull Request

## 👨‍� Developer

**Developed by [prakhar.dev](https://prakharcodes.netlify.app/)**

---

<div align="center">
  <b>Made with ❤️ by prakhar.dev</b><br>
  <i>Enjoy beautiful weather forecasts, anywhere in the world!</i> 🌍✨
</div>
