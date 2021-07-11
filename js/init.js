// Global constants and variables
const USERNAME = 'ivan4usa'; // Username for weather API
const COUNTRY_CODE = 'US'; // Country code for weather API
const DIGITS = ['1', '2', '3', '4', '5', '6','7','8', '9', '0']; // array with numbers
const container = document.getElementById('container');
const zipCodeInput = document.getElementById('zipCodeInput');
const weather = document.getElementById('weather');
const city = document.getElementById('city');
const updated = document.getElementById('updated');
const picture = document.getElementById('picture');
const temperature = document.getElementById('temperature');
const temperatureIcon = document.getElementById('temperatureIcon');
const humidity = document.getElementById('humidity');
const dewPoint = document.getElementById('dewPoint');
const windy = document.getElementById('windy');
const windSpeed = document.getElementById('windSpeed');
const windDirection = document.getElementById('windDirection');
const error = document.getElementById('error-message');
const spinner = document.getElementById('spinner');
let weatherData = {};

// Run input mask
inputMask(zipCodeInput);
// Focus cursor on input field
zipCodeInput.focus();

// Method which gets weather data by API
function getAllData(zipCode) {
    event.preventDefault();
    if (zipCode.trim().length != 5) {
        return;
    }
    cleanPreviousResult();
    spinnerShowTrigger(true);
    getLocation(zipCode)
    .then((location) => {
        return getWeather(location);
    })
    .then((weather) => {
        if (typeof weather === 'string') {
            showErrorMessage(weather);
            spinnerShowTrigger(false);
        } else if (typeof weather === 'object' && weather !== null) {
            showWeatherInfo(weather);
            spinnerShowTrigger(false);
        }
    });
}

// Method which takes zip code and gets lng, lat, city and state
function getLocation(zipCode) {
    return new Promise((resolve) => {
        let xml = new XMLHttpRequest();
        let url = 'http://api.geonames.org/postalCodeSearchJSON?postalcode=' + zipCode +
            '&countryCode=' + COUNTRY_CODE + '&username=' + USERNAME;
        xml.open('GET', url);
        xml.send();
        xml.onload = function(e) {
            if (this.status === 200) {
                let response = JSON.parse(this.response);
                if (response.postalCodes && response.postalCodes.length > 0) {
                    resolve({
                        lng: response.postalCodes[0].lng,
                        lat: response.postalCodes[0].lat,
                        city: response.postalCodes[0].placeName,
                        state: response.postalCodes[0].adminCode1,
                        code: response.postalCodes[0].postalCode
                    });
                } else resolve('Location not found');
            } else resolve('Location data not recieved');
        }
    });
}

function spinnerShowTrigger(action) {
    if (action && spinner.classList.contains('d-none')) {
        spinner.classList.remove('d-none');
    }
    if (!action && !spinner.classList.contains('d-none')) {
        spinner.classList.add('d-none');
    }
}

// Method which send request to API for receiving the weather data
function getWeather(location) {
    return new Promise((resolve) => {
        if (location.lng && location.lat) {
            let xml = new XMLHttpRequest();
            let url = 'http://api.geonames.org/findNearByWeatherJSON?lat=' + location.lat + '&lng=' + location.lng +
                '&username=' + USERNAME;
            xml.open('GET', url);
            xml.send();
            xml.onload = function() {
                if (this.status === 200) {
                    let response = JSON.parse(this.response);
                    resolve({weather: response, location: location});
                } else resolve('Weather not recived');
            }
        } else resolve('Location is wrong');
    });
}

// Method which inserts error message to html page
function showErrorMessage(errorMessage) {
    error.classList.remove('d-none');
    error.innerHTML = `<p class="text-warning text-center m-3">${errorMessage}</p>`;
}

// Method which inserts the weather data to html page
function showWeatherInfo(data) {
    weather.classList.remove('d-none');
    city.innerText = data.location.city + ', ' + data.location.state;
    updated.innerText = 'Updated ' + new Date(data.weather.weatherObservation.datetime).toLocaleDateString();
    let icon = getIcon(data.weather);
    picture.innerHTML = `<img src="../images/${icon}" alt="weather icon" class="img-fluid">`;
    temperature.innerHTML = (+data.weather.weatherObservation.temperature).toFixed(1) + '&deg';
    if (celsiusToFahrenheit(+data.weather.weatherObservation.temperature) >= 83) {
        temperatureIcon.innerHTML = '<img src="../images/hot.png" alt="hot" width="25">';
    }
    if (celsiusToFahrenheit(+data.weather.weatherObservation.temperature) <= 34) {
        temperatureIcon.innerHTML = '<img src="../images/cold.png" alt="cold" width="25">';
    }
    humidity.innerHTML = '<i class="fas fa-tint me-2"></i>' + data.weather.weatherObservation.humidity + '%';
    dewPoint.innerHTML = '<i class="fas fa-hand-holding-water me-1"></i>' + data.weather.weatherObservation.dewPoint + '&deg';
    if (+data.weather.weatherObservation.windSpeed > 15) {
        windy.innerHTML = '<i class="fas fa-wind ms-2"></i>';
    }
    windSpeed.innerHTML = data.weather.weatherObservation.windSpeed + ' mph';
    windDirection.innerHTML = `<i class="fas fa-location-arrow" style="transform: rotate(${data.weather.weatherObservation.windDirection - 45}deg)"></i>`;
}

// Method which loads weather icon depending on weather data
function getIcon(weather) {
    switch (weather.weatherObservation.weatherCondition){
        case "drizzle":
        case "light showers rain":
        case "light rain":
          return "weather-showers-scattered.png";
        case "rain":
          return "weather-showers.png";
        case "light snow":
        case "snow grains":
          return "weather-snow.png";
    }
    switch (weather.weatherObservation.clouds) {
        case "few clouds":
        case "scattered clouds":
          return "weather-few-clouds.png";
        case "clear sky":
          return "weather-clear.png"
        case "broken clouds":
        case "overcast":
          return "weather-overcast.png";
    }
    return "weather-fog.png";
}

// Method that switches the temperature display between Celsius and Fahrenheit
function changeMeasurement(e) {
    let value = e.target.value;
    let temperatureString = temperature.textContent;
    let temperatureNumber = +temperatureString.substring(0, temperatureString.length - 1);
    if (value === 'fahrenheit') {
        temperature.innerHTML = celsiusToFahrenheit(temperatureNumber).toFixed(1) + '&deg';
    } else if (value === 'celsius') {
        temperature.innerHTML = fahrenheitToCelsius(temperatureNumber).toFixed(1) + '&deg';
    }
}

// Celsius to Fahrenheit conversion
function celsiusToFahrenheit(celsius) {
    return celsius * 1.8 + 32;
}

// Fahrenheit to Celsius conversion
function fahrenheitToCelsius(fahrenheit) {
    return 5/9 * (fahrenheit - 32);
}

// Method which cleans data from html page
function cleanPreviousResult() {
    document.getElementById("celsius").checked = true;
    document.getElementById("fahrenheit").checked = false;
    city.innerText = '';
    updated.innerText = '';
    picture.innerHTML = '';
    temperature.innerHTML = '';
    temperatureIcon.innerHTML = '';
    humidity.innerHTML = '';
    dewPoint.innerHTML = '';
    windy.innerHTML = '';
    windSpeed.innerHTML = '';
    windDirection.innerHTML = '';
    error.innerHTML = '';
    if (!error.classList.contains('d-none')) {
        error.classList.add('d-none');
    }
    if (!spinner.classList.contains('d-none')) {
        spinner.classList.add('d-none');
    }
}

// Method which takes input element, adds eventListener to it, and excluds any other symbols except numbers
function inputMask(input) {
    input.addEventListener('input', event => {
        event.preventDefault();
        let inputString = event.target.value;
        if (inputString.length > 0) {
            let lastChar = inputString[inputString.length - 1];
            if (!DIGITS.includes(lastChar) || inputString.length > 5) {
                let acceptableString = inputString.substring(0, inputString.length - 1);
                input.value = acceptableString;
            }
            if (inputString.length === 5) {
                getAllData(inputString);
            } else {
                if(!weather.classList.contains('d-none')) {
                    cleanPreviousResult();
                    weather.classList.add('d-none');
                }
            }
        }
    });
}
