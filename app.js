// Your OpenWeatherMap API Key
const API_KEY = '7270bcb9af5c2b502dca8a8efa49e146';  
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Function to fetch weather data
function getWeather(city) {
    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;
    
    axios.get(url)
        .then(function(response) {
            console.log('Weather Data:', response.data);
            displayWeather(response.data);
        })
        .catch(function(error) {
            console.error('Error fetching weather:', error);
            document.getElementById('weather-display').innerHTML = 
                '<p class="loading">Could not fetch weather data. Please try again.</p>';
        });
}

function displayWeather(data) {
    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    
    const weatherHTML = `
        <div class="weather-info">
            <h2 class="city-name">${cityName}</h2>
            <img src="${iconUrl}" alt="${description}" class="weather-icon">
            <div class="temperature">${temperature}°C</div>
            <p class="description">${description}</p>
        </div>
    `;
    
    document.getElementById('weather-display').innerHTML = weatherHTML;
}

// Call function when page loads
getWeather('Tokyo');
