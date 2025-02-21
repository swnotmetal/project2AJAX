# Visa Requirement Checker

A web application built for the Dynamic Web Applications with Javascript (TO00BL10-3027) course - Project 2.

## Overview

This application allows users to check visa requirements between countries. Users can input their passport country and destination country to get detailed visa information including stay duration, visa requirements, and other relevant travel information.

## Features

- Check visa requirements between any two countries
- Get detailed information about:
  - Visa requirements
  - Allowed stay duration
  - Passport validity requirements
  - Capital city
  - Currency
  - Phone code
  - Timezone
  - Special exceptions or conditions

## Technologies Used

- HTML5
- CSS3
- JavaScript (AJAX)
- RapidAPI (Visa Requirements API)
- REST Countries API

## Setup

1. Clone the repository:
```bash
git clone [your-repository-url]
```

2. Create a `config.js` file in the root directory:
```javascript
export const API_KEY = 'your-rapidapi-key';
```

3. Open `index.html` in a modern web browser

## API Keys

This project requires an API key from RapidAPI. To get one:
1. Sign up at [RapidAPI](https://rapidapi.com)
2. Subscribe to the [Visa Requirements API](https://rapidapi.com/Yovanhu/api/visa-requirement/)
3. Copy your API key
4. Add it to your `config.js` file

## Deployment

This project is deployed on Netlify. Environment variables are managed through Netlify's environment variable system.

## Project Structure

```
AJAX/
├── index.html          # Main HTML file
├── styles.css         # CSS styles
├── app.js            # Main JavaScript file
├── config.js         # API key configuration (git-ignored)
├── .gitignore       # Git ignore file
└── README.md        # Project documentation
```

## Notes

- The application uses AJAX calls to fetch data from APIs
- Error handling is implemented for invalid country names and API errors
- Responsive design works on both desktop and mobile devices

## Author

Shuang Wu

## License

This project is part of the Dynamic Web Applications with Javascript course at Laurea University of Applied Sciences.