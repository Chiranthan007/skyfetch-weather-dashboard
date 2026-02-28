function WeatherApp(apiKey) {

    this.apiKey = apiKey;

    this.apiUrl = "https://api.openweathermap.org/data/2.5/weather";
    this.forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

    this.searchBtn = document.getElementById("search-btn");
    this.cityInput = document.getElementById("city-input");
    this.weatherDisplay = document.getElementById("weather-display");

    this.recentSearchesSection = document.getElementById("recent-searches-section");
    this.recentSearchesContainer = document.getElementById("recent-searches-container");

    this.recentSearches = [];
    this.maxRecentSearches = 5;

    this.init();

}

WeatherApp.prototype.init = function () {

    this.searchBtn.addEventListener(
        "click",
        this.handleSearch.bind(this)
    );

    this.cityInput.addEventListener("keypress", function (event) {

        if (event.key === "Enter") {
            this.handleSearch();
        }

    }.bind(this));

    this.loadRecentSearches();
    this.loadLastCity();

};

WeatherApp.prototype.showWelcome = function () {

    const welcomeHTML = `
        <div class="welcome-message">
            <h3>🌍 Welcome to SkyFetch</h3>
            <p>Search for a city to get the latest weather</p>
        </div>
    `;

    this.weatherDisplay.innerHTML = welcomeHTML;

};

WeatherApp.prototype.handleSearch = function () {

    const city = this.cityInput.value.trim();

    if (!city) {
        this.showError("Please enter a city name.");
        return;
    }

    this.getWeather(city);

    this.cityInput.value = "";

};

WeatherApp.prototype.getWeather = async function (city) {

    const currentWeatherUrl = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    this.showLoading();

    this.searchBtn.disabled = true;
    this.searchBtn.textContent = "Searching...";

    try {

        const [currentWeather, forecastData] = await Promise.all([
            axios.get(currentWeatherUrl),
            this.getForecast(city)
        ]);

        this.displayWeather(currentWeather.data);
        this.displayForecast(forecastData);

        this.saveRecentSearch(city);
        localStorage.setItem("lastCity", city);

    } catch (error) {

        console.error("Error:", error);

        if (error.response && error.response.status === 404) {
            this.showError("City not found. Please check spelling.");
        } else {
            this.showError("Something went wrong. Please try again.");
        }

    } finally {

        this.searchBtn.disabled = false;
        this.searchBtn.textContent = "Search";

    }

};

WeatherApp.prototype.getForecast = async function(city) {

    const url = `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {

        const response = await axios.get(url);

        return response.data;

    } catch (error) {

        console.error("Forecast error:", error);

        throw error;

    }

};

WeatherApp.prototype.displayWeather = function (data) {

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

    this.weatherDisplay.innerHTML = weatherHTML;

};

WeatherApp.prototype.processForecastData = function(data) {

    const dailyForecasts = data.list.filter(function(item){
        return item.dt_txt.includes("12:00:00");
    });

    return dailyForecasts.slice(0,5);

};

WeatherApp.prototype.displayForecast = function(data) {

    const dailyForecasts = this.processForecastData(data);

    const forecastHTML = dailyForecasts.map(function(day){

        const date = new Date(day.dt * 1000);

        const dayName = date.toLocaleDateString("en-US", {
            weekday: "short"
        });

        const temp = Math.round(day.main.temp);
        const description = day.weather[0].description;
        const icon = day.weather[0].icon;

        const iconUrl =
            `https://openweathermap.org/img/wn/${icon}@2x.png`;

        return `
            <div class="forecast-card">
                <h4>${dayName}</h4>
                <img src="${iconUrl}" alt="${description}">
                <div class="forecast-temp">${temp}°C</div>
                <p>${description}</p>
            </div>
        `;

    }).join("");

    const forecastSection = `
        <div class="forecast-section">
            <h3 class="forecast-title">5-Day Forecast</h3>
            <div class="forecast-container">
                ${forecastHTML}
            </div>
        </div>
    `;

    this.weatherDisplay.innerHTML += forecastSection;

};

WeatherApp.prototype.showLoading = function () {

    const loadingHTML = `
        <div class="loading-container">
            <p>Loading weather data...</p>
        </div>
    `;

    this.weatherDisplay.innerHTML = loadingHTML;

};

WeatherApp.prototype.showError = function (message) {

    const errorHTML = `
        <div class="error-message">
            <p>${message}</p>
        </div>
    `;

    this.weatherDisplay.innerHTML = errorHTML;

};

WeatherApp.prototype.loadRecentSearches = function(){

    const saved = localStorage.getItem("recentSearches");

    if(saved){
        this.recentSearches = JSON.parse(saved);
    }

    this.displayRecentSearches();

};

WeatherApp.prototype.saveRecentSearch = function(city){

    const cityName =
        city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

    const index = this.recentSearches.indexOf(cityName);

    if(index > -1){
        this.recentSearches.splice(index,1);
    }

    this.recentSearches.unshift(cityName);

    if(this.recentSearches.length > this.maxRecentSearches){
        this.recentSearches.pop();
    }

    localStorage.setItem(
        "recentSearches",
        JSON.stringify(this.recentSearches)
    );

    this.displayRecentSearches();

};

WeatherApp.prototype.displayRecentSearches = function(){

    this.recentSearchesContainer.innerHTML = "";

    if(this.recentSearches.length === 0){
        this.recentSearchesSection.style.display = "none";
        return;
    }

    this.recentSearchesSection.style.display = "block";

    this.recentSearches.forEach(function(city){

        const btn = document.createElement("button");

        btn.className = "recent-search-btn";
        btn.textContent = city;

        btn.addEventListener("click", function(){

            this.cityInput.value = city;
            this.getWeather(city);

        }.bind(this));

        this.recentSearchesContainer.appendChild(btn);

    }.bind(this));

};

WeatherApp.prototype.loadLastCity = function(){

    const lastCity = localStorage.getItem("lastCity");

    if(lastCity){
        this.getWeather(lastCity);
    }else{
        this.showWelcome();
    }

};

const app = new WeatherApp("7270bcb9af5c2b502dca8a8efa49e146");