// Your OpenWeatherMap API Key
const API_KEY = '7270bcb9af5c2b502dca8a8efa49e146';  // Replace with your actual API key
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

async function getWeather(city) {

    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;

    try {

        const response = await axios.get(url);

        console.log('Weather Data:', response.data);

        displayWeather(response.data);

    } catch (error) {

        console.error('Error fetching weather:', error);

        document.getElementById('weather-display').innerHTML =
            '<p class="loading">Could not fetch weather data. Please try again.</p>';

    }
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


const searchBtn = document.getElementById("search-btn")
const cityInput = document.getElementById("city-input")

searchBtn.addEventListener("click", function () {

    const city = cityInput.value.trim()

    if (!city) {
        alert("Please enter a city name")
        return
    }

    getWeather(city)

    cityInput.value = ""
})

cityInput.addEventListener("keypress", function (event) {

    if (event.key === "Enter") {
        searchBtn.click()
    }

})