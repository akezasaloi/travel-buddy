

document.addEventListener('DOMContentLoaded', function() {
    let useCelsius = true; 
    
    window.getWeather = function() {
        const apiKey = '7baf2235b4a81307fbdef997d33f6479';
        const cityInput = document.getElementById("cityInput");
        const city = cityInput.value;

        if(!city) {
            alert('Please enter a city');
            return;
        }

        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

        fetch(currentWeatherUrl)
            .then(response => response.json())
            .then(data => {
                displayWeatherData(data);
            })
            .catch(error => {
                console.error('Error fetching weather:', error);
                alert('Error fetching weather data');
            });

        fetch(forecastUrl)
            .then(response => response.json())
            .then(data => {
                displayHourlyForecast(data.list);
            })
            .catch(error => {
                console.error('Error fetching forecast:', error);
            });
    };
// window.onload.getWeather()
    window.toggleTemperature = function() {
        useCelsius = !useCelsius;
        document.getElementById('temp-toggle').textContent = useCelsius ? '°C' : '°F';
        const cityInput = document.getElementById("cityInput");
        if (cityInput.value) {
            getWeather();
        }
    };

    function displayWeatherData(data) {
        // const weatherContainer = document.getElementById('weather-container');
        const tempDivInfo = document.getElementById('temp-div');
        const weatherInfoDiv = document.getElementById('weather-info');
        const hourlyForecastDiv = document.getElementById('hourly-forecast');


        weatherInfoDiv.innerHTML = '';
        hourlyForecastDiv.innerHTML = '';
        tempDivInfo.innerHTML = '';

        if(data.cod === '404') {
            weatherInfoDiv.innerHTML = '<p>City not found. Please try another city.</p>';
            return;
        }

        const cityName = data.name;
        const country = data.sys.country;
        const tempCelsius = Math.round(data.main.temp - 273.15);
        const tempFahrenheit = Math.round((tempCelsius * 9/5) + 32);
        const description = data.weather[0].description;
        const iconCode = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        const temperature = useCelsius ? `${tempCelsius}°C` : `${tempFahrenheit}°F`;

        const weatherHTML = `
            <div class="weather-header">
                <h2 style="color:white">${cityName}, ${country}</h2>
                <img src="${iconUrl}" alt="${description}" class="weather-icon">
            </div>
            <div class="weather-details">
                <p class="temperature" style="color:white">${temperature}</p>
                <p class="description">${description}</p>
                <p>Humidity: ${data.main.humidity}%</p>
                <p>Wind: ${data.wind.speed} m/s</p>
            </div>
        `;

        weatherInfoDiv.innerHTML = weatherHTML;
    }

    function displayHourlyForecast(hourlyData) {
        const hourlyForecastDiv = document.getElementById('hourly-forecast');
        hourlyForecastDiv.innerHTML = '<h3>24-Hour Forecast</h3>';
        
        const forecastContainer = document.createElement('div');
        forecastContainer.className = 'hourly-container';

        const next24Hours = hourlyData.slice(0, 8);

        next24Hours.forEach(item => {
            const dateTime = new Date(item.dt * 1000);
            const hour = dateTime.getHours();
            const tempCelsius = Math.round(item.main.temp - 273.15);
            const tempFahrenheit = Math.round((tempCelsius * 9/5) + 32);
            const temperature = useCelsius ? `${tempCelsius}°C` : `${tempFahrenheit}°F`;
            const iconCode = item.weather[0].icon;
            const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

            const hourlyItemHtml = `
                <div class="hourly-item">
                    <span class="hour">${hour}:00</span>
                    <img src="${iconUrl}" alt="Weather icon" class="hourly-icon">
                    <span class="hourly-temp">${temperature}</span>
                </div>
            `;
            forecastContainer.innerHTML += hourlyItemHtml;
        });

        hourlyForecastDiv.appendChild(forecastContainer);
    }
});
