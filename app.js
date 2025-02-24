// Set up a variable to show error messages
let errorElement;

// Set up API key variable - we'll fill this in later
let x_rapidapi_key;

// Check if we're running locally (for development), this is to avoid unprofessionally sending API to public github repo
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // If local, grab the API key from our secret config file
    import('./config.js')
        .then(config => {
            x_rapidapi_key = config.API_KEY;
        })
        // If something goes wrong loading the config, let us know in the console
        .catch(err => console.error('Error loading config:', err));
} else {
    // If the site is live on Netlify, use their environment variable system
    x_rapidapi_key = 'NETLIFY_API_KEY_PLACEHOLDER';
}

// Once the page loads, find our error message container
document.addEventListener('DOMContentLoaded', () => {
    errorElement = document.querySelector('.error');
});

// Listen for when user submits the form
document.getElementById('country-form').addEventListener('submit', async (event) => {
    // Stop the form from doing its normal thing
    event.preventDefault();
    
    // Grab what countries the user typed in
    const passportCountry = document.getElementById('passport').value;
    const destinationCountry = document.getElementById('country').value;
    
    // If they're the same country, tell them they don't need a visa!
    if (passportCountry == destinationCountry){
        showNotification('You do not need a visa for your home country');
        return;
    }

    // First, let's get the country codes
    getCountryCode(passportCountry, function(passportCode) {
        getCountryCode(destinationCountry, function(destinationCode) {
            // If we couldn't find either country, show an error
            if (!passportCode || !destinationCode) {
                showNotification('Invalid passport or destination country name.');
                return;
            }

            // Set up visa requirements API call
            const xhr = new XMLHttpRequest();
            const url = 'https://visa-requirement.p.rapidapi.com/';
            
            // Configure the request
            xhr.open('POST', url, true);
            xhr.setRequestHeader('x-rapidapi-key', `${x_rapidapi_key}`);
            xhr.setRequestHeader('x-rapidapi-host', 'visa-requirement.p.rapidapi.com');
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

            // What to do when we get a response
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {  // Request is complete
                    if (xhr.status === 200) {  // And successful!
                        const result = JSON.parse(xhr.responseText);
                        displayResult(result);
                    } else {  //something went wrong and notification is pushed to the user
                        showNotification('An error occurred while fetching data.');
                    }
                }
            };

            // Package up our country codes to send
            const params = new URLSearchParams({
                passport: passportCode,
                destination: destinationCode
            });

            // Send it!
            xhr.send(params);
        });
    });
});

// This function converts country names to their two-letter codes
function getCountryCode(countryName, callback) {
    const xhr = new XMLHttpRequest();
    const url = `https://restcountries.com/v3.1/name/${countryName}`;

    xhr.open('GET', url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);

                // Map the data to something simpler
                data.map(country => ({
                    name: country.name.common,
                    official: country.name.official,
                    code: country.cca2 // Mapped out based on the structure of the returned API information
                }))

                // Special case for China (because there's mainland China, Honkong, Macau and Taiwan in the API call)
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
                // For all other countries, just use the first match
                if (data.length > 0 && data[0].cca2) {
                    callback(data[0].cca2);
                    return;
                }
            }
            callback(null);
        }
    };

    // If something goes wrong, log it and return null
    xhr.onerror = function() {
        console.error(`Error fetching country code for ${countryName}`);
        callback(null);
    };

    xhr.send(); // sends the request to the 'server'
}

// This function shows all the visa info on the page
function displayResult(data) {
    const outputElement = document.getElementById('output'); // fetching id from the DOM
    
    // If there's an error, show it and hide the results
    if (data.error) {
        showNotification('An error occurred: ' + data.error);
        outputElement.style.display = 'none';
        return;
    }

    // Update all the simple text fields at once, it is a bit hard to read but the code is cleaner this way.
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
    }); //using forEach to update result output element

    // Handle the exceptions text (this might contain HTML), this is for handling extra information from the API
    const exceptElement = document.getElementById('except_text');
    if (exceptElement && data.except_text) {
        // Convert HTML entities to actual HTML
        const decodedText = decodeHTMLEntities(data.except_text);
        exceptElement.innerHTML = decodedText;
        // Make any links in the exceptions open in new tabs
        exceptElement.querySelectorAll('a').forEach(link => {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        });
    } else if (exceptElement) {
        exceptElement.textContent = 'N/A';
    }

    // Handle the main link separately, sometimes API would provide a link, which needs to be formatted for better viewing
    const linkElement = document.getElementById('link');
    if (linkElement) {
        if (data.link && data.link !== '') {
            // Make sure the link starts with http
            linkElement.href = data.link.startsWith('http') ? data.link : 'https://' + data.link;
            linkElement.style.display = 'inline';
            linkElement.target = '_blank';
            linkElement.rel = 'noopener noreferrer';
        } else {
            linkElement.style.display = 'none';
        }
    } //Stackoverflow came to my aid

    // Show the results
    outputElement.style.display = 'block';
}

// Helper function to handle HTML in text
function decodeHTMLEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}

// Shows error messages in a nice way, i used the same method in the to-do  app
function showNotification(msg) {
    // Clear any existing timeout
    if (window.notificationTimeout) {
        clearTimeout(window.notificationTimeout);
    }
    
    // Show the message
    errorElement.textContent = msg;
    errorElement.classList.add('notif-enter');
    
    // Make it disappear after 3 seconds
    window.notificationTimeout = setTimeout(() => {
        errorElement.classList.remove('notif-enter');
    }, 3000);
}

