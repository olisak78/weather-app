# Israel Weather App

## Setup Instructions

### 1. Clone the Repository

```
git clone https://github.com/olisak78/weather-app.git
cd weather-app
```

### 2. Install Dependencies

```
npm install
```

### 3. Start the Development Server

```
npm start
```

The app will open automatically in your browser at `http://localhost:3000`.

## Overview

A modern, responsive weather application built with React and TypeScript that provides real-time weather information for locations across Israel. The app features bilingual support (English/Hebrew), multiple themes, and intelligent caching for optimal performance.

## Features

**- Location Search**: Autocomplete search for Israeli cities and locations

**- Current Weather**: Real-time weather data including temperature, humidity, wind, pressure, and visibility

**- Bilingual Support**: Full Hebrew and English localization with RTL support

**- Theme Toggle**: Light and dark theme modes

**- Units Toggle**: Switch between metric and imperial units

**- Smart Caching**: 30-minute caching system to reduce API calls

**- Responsive Design**: Mobile-friendly interface

**- Color-coded Temperatures**: Visual temperature indicators

## Technology Stack

**- Frontend Framework**: React 19.1.1

**- Language**: TypeScript 4.9.5

**- State Management**: Redux Toolkit 2.8.2

**- Styling**: SCSS (Sass 1.90.0)

**- Internationalization**: react-i18next 15.6.1

**- Icons**: React Icons 5.5.0

**- Coordinate Conversion**: proj4 2.19.10 (ITM to WGS84)

**- Build Tool**: Create React App 5.0.1

## Configuration

### API Configuration

The app uses WeatherAPI.com for weather data. The API configuration is located in `src/types/index.ts`

### Caching Configuration

Cache settings can be modified in `src/types/index.ts`:

```
export const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes
export const MAX_CACHE_SIZE = 50; // Maximum cached locations
```

### Supported Languages

- English
- Hebrew (with full RTL support)

## Data Sources

**- Weather Data**: `WeatherAPI.com`

**- Location Data**: Israeli government open data API `data.gov.il` for city/location information

**- Coordinate System**: ITM (Israeli Transverse Mercator) to WGS84 conversion
