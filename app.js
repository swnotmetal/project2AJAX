let errorElement;
//import { API_KEY } from "./config.js"; remove for delopyment

// For development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    import('./config.js')
        .then(config => {
            x_rapidapi_key = config.API_KEY;
        })
        .catch(err => console.error('Error loading config:', err));
} else {
    // For production - Netlify will replace this during build
    x_rapidapi_key = 'NETLIFY_API_KEY_PLACEHOLDER';
}

// Initialize error element when document loads
document.addEventListener('DOMContentLoaded', () => {
    errorElement = document.querySelector('.error');
});

document.getElementById('country-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const passportCountry = document.getElementById('passport').value;
    const destinationCountry = document.getElementById('country').value;
    
    if (passportCountry == destinationCountry){
        showNotification('You do not need a visa for your home country');
        return;
    }

    // Get country codes using AJAX
    getCountryCode(passportCountry, function(passportCode) {
        getCountryCode(destinationCountry, function(destinationCode) {
            if (!passportCode || !destinationCode) {
                showNotification('Invalid passport or destination country name.');
                return;
            }

            // Make visa requirements API call
            const xhr = new XMLHttpRequest();
            const url = 'https://visa-requirement.p.rapidapi.com/';
            
            xhr.open('POST', url, true);
            xhr.setRequestHeader('x-rapidapi-key', `${x_rapidpai_key}`);
            xhr.setRequestHeader('x-rapidapi-host', 'visa-requirement.p.rapidapi.com');
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const result = JSON.parse(xhr.responseText);
                        displayResult(result);
                    } else {
                        showNotification('An error occurred while fetching data.');
                    }
                }
            };

            const params = new URLSearchParams({
                passport: passportCode,
                destination: destinationCode
            });

            xhr.send(params);
        });
    });
});

function getCountryCode(countryName, callback) {
    const xhr = new XMLHttpRequest();
    const url = `https://restcountries.com/v3.1/name/${countryName}`;

    xhr.open('GET', url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);

                    data.map(country => ({
                        name: country.name.common,
                        official: country.name.official,
                        code: country.cca2
                    }))

                // Special handling for China
                if (countryName.toLowerCase() === 'china') {
                    const mainlandChina = data.find(country => 
                        country.name.common === 'China' || 
                        country.official === "People's Republic of China"
                    );
                    if (mainlandChina) {
                        callback(mainlandChina.cca2);
                        return;
                    }
                }
                // For other countries
                if (data.length > 0 && data[0].cca2) {
                    callback(data[0].cca2);
                    return;
                }
            }
            callback(null);
        }
    };

    xhr.onerror = function() {
        console.error(`Error fetching country code for ${countryName}`);
        callback(null);
    };

    xhr.send();
}


function displayResult(data) {
    const outputElement = document.getElementById('output');
    
    if (data.error) {
        showNotification('An error occurred: ' + data.error);
        outputElement.style.display = 'none';
        return;
    }

    // Update all result fields except except_text
    const fields = [
        'passport_of', 'destination', 'visa', 'stay_of',
        'capital', 'currency', 'pass_valid', 'phone_code',
        'timezone'
    ];

    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.textContent = data[field] || 'N/A';
        }
    });

    // Handle exceptions text with HTML content
    const exceptElement = document.getElementById('except_text');
    if (exceptElement && data.except_text) {
        // Decode HTML entities first
        const decodedText = decodeHTMLEntities(data.except_text);
        // Set the HTML content
        exceptElement.innerHTML = decodedText;
        // Make all links open in new tab
        exceptElement.querySelectorAll('a').forEach(link => {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        });
    } else if (exceptElement) {
        exceptElement.textContent = 'N/A';
    }

    // Handle main link separately
    const linkElement = document.getElementById('link');
    if (linkElement) {
        if (data.link && data.link !== '') {
            linkElement.href = data.link.startsWith('http') ? data.link : 'https://' + data.link;
            linkElement.style.display = 'inline';
            linkElement.target = '_blank';
            linkElement.rel = 'noopener noreferrer';
        } else {
            linkElement.style.display = 'none';
        }
    }

    outputElement.style.display = 'block';
}

// Helper function to decode HTML entities
function decodeHTMLEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}

function showNotification(msg) {
    if (window.notificationTimeout) {
        clearTimeout(window.notificationTimeout);
    }
    
    errorElement.textContent = msg;
    errorElement.classList.add('notif-enter');
    
    window.notificationTimeout = setTimeout(() => {
        errorElement.classList.remove('notif-enter');
    }, 3000);
}

