# Weather.app

## Installation

Project has been developed with Node 14.18.1 installed. Package management has been done with npm, version 8.1.1.

```
git clone <repository>
npm install
```

## Initial configuration

In order to start application:

- Copy `.env.development.example` to `.env.development.local`.
- Fill in your [OpenWeatherMap API key](https://home.openweathermap.org/api_keys) in `OPENWEATHER_API_KEY` entry in newly created `.env.development.local`. You can also use environment variables directly.

## Start

```
npm start
```

This sets up development environment on `http://localhost:3000` and starts API service in `http://localhost:9000`.

## Rationale about project

Rationale about tooling used and further plans is summarized inside `SUMMARY.md` file.
