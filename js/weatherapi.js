const API_KEY = '28b648e35da549f0a32183117211107';
const DIGITS = ['1', '2', '3', '4', '5', '6','7','8', '9', '0']; // array with numbers

const container = document.getElementById('container');
const zipCodeInput = document.getElementById('zipCodeInput');
const weather = document.getElementById('weather');
const city = document.getElementById('city');
const updated = document.getElementById('updated');
const picture = document.getElementById('picture');
const condition = document.getElementById('condition');
const temperatureCelsius = document.getElementById('temperatureCelsius');
const temperatureFahrenheit = document.getElementById('temperatureFahrenheit');
const temperatureIcon = document.getElementById('temperatureIcon');
const humidity = document.getElementById('humidity');
const uv = document.getElementById('uv');
const precip_in = document.getElementById('precip_in');
const precip_mm = document.getElementById('precip_mm');
const pressure_in = document.getElementById('pressure_in');
const pressure_mb = document.getElementById('pressure_mb');
const vis_miles = document.getElementById('vis_miles');
const vis_km = document.getElementById('vis_km');
const wind_mph = document.getElementById('wind_mph');
const wind_kph = document.getElementById('wind_kph');
const windDirection = document.getElementById('windDirection');
const forecast = document.getElementById('forecast');
const error = document.getElementById('error-message');
const spinner = document.getElementById('spinner');

inputMask(zipCodeInput);

function getWeatherByZipCode(zipCode, days) {
    if (zipCode.trim().length != 5) {
        return;
    }
    cleanPreviousResult();
    spinnerShowTrigger(true);
    let xhr = new XMLHttpRequest();
    // let url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${zipCode}&aqi=yes`;
    let url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${zipCode}&days=${days}&aqi=yes&alerts=no`;
    xhr.open('GET', url);
    xhr.send();

    xhr.onload = function() {
        let response = JSON.parse(this.response);
        if (this.status === 200) {
            showWeatherInfo(response);
            spinnerShowTrigger(false);
        } else if (this.status === 400) {
            showErrorMessage(response.error.message);
            spinnerShowTrigger(false);
        }
    }
}

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
                getWeatherByZipCode(inputString, 10);
            } else {
                cleanPreviousResult();
                if (!weather.classList.contains('d-none')) {
                    weather.classList.add('d-none');
                }
            }
        }
    });
}

function showErrorMessage(errorMessage) {
    error.classList.remove('d-none');
    error.innerHTML = `<p class="text-warning text-center m-3">${errorMessage}</p>`;
}

function showWeatherInfo(data) {
    weather.classList.remove('d-none');
    city.innerText = data.location.name + ', ' + data.location.region;
    updated.innerText = new Date(data.current.last_updated).toLocaleDateString();
    condition.innerText = data.current.condition.text;
    let icon = getIcon(data);
    picture.innerHTML = `<img src="../images/${icon}" alt="weather icon" class="img-fluid">`;
    temperatureCelsius.innerHTML = data.current.temp_c + '&deg';
    temperatureFahrenheit.innerHTML = data.current.temp_f + '&deg';
    if (+data.current.temp_f >= 83) {
        temperatureIcon.innerHTML = '<img src="../images/hot.png" alt="hot" width="25">';
    }
    if (+data.current.temp_f <= 34) {
        temperatureIcon.innerHTML = '<img src="../images/cold.png" alt="cold" width="25">';
    }
    humidity.innerText = data.current.humidity + '%';
    uv.innerText = data.current.uv;
    precip_in.innerHTML = data.current.precip_in + ' in';
    precip_mm.innerHTML = data.current.precip_mm + ' mm';
    pressure_in.innerHTML = data.current.pressure_in + ' in';
    pressure_mb.innerHTML = data.current.pressure_mb + ' mb';
    vis_miles.innerHTML = data.current.vis_miles + ' mi';
    vis_km.innerHTML = data.current.vis_km + ' km';
    wind_mph.innerHTML = data.current.wind_mph + ' mph';
    wind_kph.innerHTML = data.current.wind_kph + ' kph';
    windDirection.innerHTML = `<i class="fas fa-location-arrow" style="transform: rotate(${data.current.wind_degree - 45}deg)"></i>`;

    if (data.forecast && data.forecast.forecastday) {
        data.forecast.forecastday.forEach((item) => {
            let day = new Intl.DateTimeFormat('en-US', {weekday:'short'}).format(new Date(item.date));
            let forecast_icon = item.day.condition.icon;
            let mintemp_c = item.day.mintemp_c ?? '';
            let mintemp_f = item.day.mintemp_f ?? '';
            let maxtemp_c = item.day.maxtemp_c ?? '';
            let maxtemp_f = item.day.maxtemp_f ?? '';
            let chance_of_rain = item.day.daily_chance_of_rain?? '';
            forecast.innerHTML += '<div class="col-4 p-0">' +
                '<div class="card text-center bg-primary border-0">' +
                    '<div class="card-body">' +
                        `<h3 class="text-warning text-center fs-5">${day}</h3>` +
                        `<img src="${forecast_icon}" alt="weather" class="img-fluid px-2">` +
                        '<div class="d-flex flex-column align-items-center">' +
                            `<span class="text-white fs-6">${mintemp_c}-${maxtemp_c}&degC</span>` +
                            `<span class="text-white fs-6">${mintemp_f}-${maxtemp_f}&degF</span>` +
                            `<span class="text-white fs-6">rain: ${chance_of_rain}%</span>` +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
        });

    }

}

// Method which loads weather icon depending on weather data
function getIcon(weather) {
    switch (weather.current.condition.code){
        case 1063:
        case 1180:
        case 1183:
        case 1186:
        case 1189:
        case 1198:
        case 1204:
        case 1249:
        case 1255:
        case 1261:
        case 1273:
          return "weather-showers-scattered.png";
        case 1087:
        case 1192:
        case 1195:
        case 1201:
        case 1207:
        case 1240:
        case 1243:
        case 1246:
        case 1252:
        case 1258:
        case 1264:
        case 1276:
          return "weather-showers.png";
        case 1066:
        case 1069:
        case 1072:
        case 1114:
        case 1117:
        case 1147:
        case 1150:
        case 1153:
        case 1168:
        case 1171:
        case 1210:
        case 1213:
        case 1216:
        case 1219:
        case 1222:
        case 1225:
        case 1237:
        case 1279:
        case 1282:
          return "weather-snow.png";
        case 1003:
        case 1006:
          return "weather-few-clouds.png";
        case 1000:
          return "weather-clear.png"
        case 1009:

          return "weather-overcast.png";
    }
    return "weather-fog.png";
}

function cleanPreviousResult() {
    city.innerText = '';
    updated.innerText = '';
    condition.innerText = '';
    picture.innerHTML = '';
    temperatureCelsius.innerHTML = '';
    temperatureFahrenheit.innerHTML = '';
    temperatureIcon.innerHTML = '';
    humidity.innerText = '';
    uv.innerText = '';
    precip_in.innerHTML = '';
    precip_mm.innerHTML = '';
    pressure_in.innerHTML = '';
    pressure_mb.innerHTML = '';
    vis_km.innerHTML = '';
    vis_miles.innerHTML = '';
    wind_kph.innerHTML = '';
    wind_mph.innerHTML = '';
    windDirection.innerHTML = '';
    error.innerHTML = '';
    if (!error.classList.contains('d-none')) {
        error.classList.add('d-none');
    }
    if (!spinner.classList.contains('d-none')) {
        spinner.classList.add('d-none');
    }
}

function spinnerShowTrigger(action) {
    if (action && spinner.classList.contains('d-none')) {
        spinner.classList.remove('d-none');
    }
    if (!action && !spinner.classList.contains('d-none')) {
        spinner.classList.add('d-none');
    }
}
