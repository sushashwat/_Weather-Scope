const API_KEY = "e333ce41ece5e929947e5961e6495b3e";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const currentLocationBtn = document.getElementById("currentLocationBtn");
const toggleUnitBtn = document.getElementById("toggleUnit");
const clearRecentBtn = document.getElementById("clearRecentBtn");

const recentSearchesSection = document.getElementById("recentSearches");
const recentList = document.getElementById("recentList");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");
const errorText = document.getElementById("errorText");
const weatherAlert = document.getElementById("weatherAlert");
const alertMessage = document.getElementById("alertMessage");
const emptyState = document.getElementById("emptyState");

const currentWeather = document.getElementById("currentWeather");
const forecastSection = document.getElementById("forecastSection");
const forecastCards = document.getElementById("forecastCards");

const currentCity = document.getElementById("currentCity");
const currentDate = document.getElementById("currentDate");
const lastUpdated = document.getElementById("lastUpdated");
const currentIcon = document.getElementById("currentIcon");
const currentTemp = document.getElementById("currentTemp");
const currentDescription = document.getElementById("currentDescription");
const currentHumidity = document.getElementById("currentHumidity");
const currentWind = document.getElementById("currentWind");
const currentVisibility = document.getElementById("currentVisibility");
const feelsLike = document.getElementById("feelsLike");
const sunriseTime = document.getElementById("sunriseTime");
const sunsetTime = document.getElementById("sunsetTime");
const skeletonLoader = document.getElementById("skeletonLoader");
const weatherData = document.getElementById("weatherData");

const toast = document.getElementById("toast");

let isCelsius = true;
let lastWeatherData = null;

  // Helper Functions

  function prepareWeatherUI() {
  hideError();
  hideAlert();
  showLoading();
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("translate-x-[120%]");
  toast.classList.add("translate-x-0");

  setTimeout(() => {
    toast.classList.remove("translate-x-0");
    toast.classList.add("translate-x-[120%]");
  }, 2500);
}

function showLoading() {
  loading.classList.remove("hidden");
}

function hideLoading() {
  loading.classList.add("hidden");
}

function showError(message) {
  errorText.textContent = message;
  errorMessage.classList.remove("hidden");
}

function hideError() {
  errorMessage.classList.add("hidden");
}

function showEmptyState() {
  emptyState.classList.remove("hidden");
}

function hideEmptyState() {
  emptyState.classList.add("hidden");
}

function showWeatherSections() {
  currentWeather.classList.remove("hidden");
  forecastSection.classList.remove("hidden");
}

function hideWeatherSections() {
  currentWeather.classList.add("hidden");
  forecastSection.classList.add("hidden");
}

function hideAlert() {
  weatherAlert.classList.add("hidden");
}

function showAlert(message) {
  alertMessage.textContent = message;
  weatherAlert.classList.remove("hidden");
}

function formatDate(timestamp, timezoneOffsetSeconds = 0) {
  const date = new Date((timestamp + timezoneOffsetSeconds) * 1000);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  });
}

function formatDayName(timestamp, timezoneOffsetSeconds = 0) {
  const date = new Date((timestamp + timezoneOffsetSeconds) * 1000);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "UTC"
  });
}

function formatTime(timestamp, timezoneOffsetSeconds = 0) {
  const date = new Date((timestamp + timezoneOffsetSeconds) * 1000);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC"
  });
}

function getTemperature(tempCelsius) {
  if (isCelsius) {
    return `${Math.round(tempCelsius)}°C`;
  }
  const fahrenheit = (tempCelsius * 9) / 5 + 32;
  return `${Math.round(fahrenheit)}°F`;
}

function getWind(speedMetersPerSecond) {
  if (isCelsius) {
    return `${(speedMetersPerSecond * 3.6).toFixed(1)} km/h`;
  }
  return `${(speedMetersPerSecond * 2.237).toFixed(1)} mph`;
}

function getVisibility(visibilityMeters) {
  if (isCelsius) {
    return `${(visibilityMeters / 1000).toFixed(1)} km`;
  }
  return `${(visibilityMeters / 1609.34).toFixed(1)} mi`;
}

function mapConditionToIcon(conditionText) {
  const text = conditionText.toLowerCase();

  if (text.includes("clear")) return "fas fa-sun text-yellow-300";
  if (text.includes("cloud")) return "fas fa-cloud text-white";
  if (text.includes("rain") || text.includes("drizzle")) return "fas fa-cloud-rain text-cyan-200";
  if (text.includes("thunder")) return "fas fa-bolt text-yellow-200";
  if (text.includes("snow")) return "fas fa-snowflake text-blue-100";
  if (text.includes("mist") || text.includes("fog") || text.includes("haze") || text.includes("smoke")) {
    return "fas fa-smog text-slate-200";
  }

  return "fas fa-cloud-sun text-yellow-200";
}

function setDynamicBackground(conditionText) {
  const body = document.body;
  const text = conditionText.toLowerCase();

  body.className = "min-h-screen text-white transition-all duration-700";

  if (text.includes("clear")) {
    body.classList.add("bg-gradient-to-br", "from-yellow-300", "via-orange-400", "to-pink-500");
  } else if (text.includes("cloud")) {
    body.classList.add("bg-gradient-to-br", "from-slate-400", "via-slate-500", "to-slate-700");
  } else if (text.includes("rain") || text.includes("drizzle")) {
    body.classList.add("bg-gradient-to-br", "from-sky-700", "via-blue-800", "to-slate-900");
  } else if (text.includes("thunder")) {
    body.classList.add("bg-gradient-to-br", "from-gray-900", "via-indigo-900", "to-black");
  } else if (text.includes("snow")) {
    body.classList.add("bg-gradient-to-br", "from-sky-100", "via-slate-200", "to-slate-400");
  } else if (text.includes("mist") || text.includes("fog") || text.includes("haze")) {
    body.classList.add("bg-gradient-to-br", "from-gray-400", "via-slate-500", "to-gray-700");
  } else {
    body.classList.add("bg-gradient-to-br", "from-sky-400", "via-blue-500", "to-indigo-600");
  }
}

       //Recent Searches

function getRecentSearches() {
  return JSON.parse(localStorage.getItem("weatherRecentSearches")) || [];
}

function saveRecentSearch(city) {
  let searches = getRecentSearches();

  searches = searches.filter(item => item.toLowerCase() !== city.toLowerCase());
  searches.unshift(city);

  if (searches.length > 6) {
    searches = searches.slice(0, 6);
  }

  localStorage.setItem("weatherRecentSearches", JSON.stringify(searches));
  renderRecentSearches();
}

function renderRecentSearches() {
  const searches = getRecentSearches();
  recentList.innerHTML = "";

  if (searches.length === 0) {
    recentSearchesSection.classList.add("hidden");
    return;
  }

  recentSearchesSection.classList.remove("hidden");

  searches.forEach((city) => {
    const button = document.createElement("button");
    button.className = "recent-city-btn";
    button.textContent = city;

    button.addEventListener("click", () => {
      cityInput.value = city;
      fetchWeatherByCity(city);
    });

    recentList.appendChild(button);
  });
}

  // Alerts

function handleWeatherAlert(weatherData) {
  hideAlert();

  const tempC = weatherData.main.temp;
  const condition = weatherData.weather[0].description.toLowerCase();

  if (tempC >= 40) {
    showAlert("Extreme heat alert: Stay hydrated and avoid direct sunlight.");
  } else if (condition.includes("thunder")) {
    showAlert("Thunderstorm alert: Better to stay indoors.");
  } else if (condition.includes("rain")) {
    showAlert("Rain alert: Carry an umbrella.");
  } else if (condition.includes("snow")) {
    showAlert("Snow alert: Travel carefully.");
  }
}

   //Forecast grouping

function getDailyForecasts(forecastList) {
  const dailyMap = new Map();

  forecastList.forEach((item) => {
    const dateKey = item.dt_txt.split(" ")[0];

    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, []);
    }

    dailyMap.get(dateKey).push(item);
  });

  const dailyArray = [];

  dailyMap.forEach((items, dateKey) => {
    let bestItem = items[0];
    const noonItem = items.find(entry => entry.dt_txt.includes("12:00:00"));

    if (noonItem) {
      bestItem = noonItem;
    }

    const avgHumidity =
      items.reduce((sum, entry) => sum + entry.main.humidity, 0) / items.length;

    const maxWind = Math.max(...items.map(entry => entry.wind.speed));

    dailyArray.push({
      dateKey,
      item: bestItem,
      avgHumidity: Math.round(avgHumidity),
      maxWind
    });
  });

  return dailyArray.slice(0, 6);
}

  // Render Weather

function renderCurrentWeather(data) {
  const weatherData = data.current;
  const timezoneOffset = weatherData.timezone;

  lastWeatherData = data;

  const cleanCity = weatherData.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  currentCity.textContent = cleanCity;
  currentDate.textContent = formatDate(weatherData.dt, timezoneOffset);
  lastUpdated.textContent = `Last updated: ${formatTime(weatherData.dt, timezoneOffset)}`;

  currentIcon.className = `${mapConditionToIcon(weatherData.weather[0].description)} text-7xl`;

  currentTemp.textContent = getTemperature(weatherData.main.temp);
  currentDescription.textContent = weatherData.weather[0].description;

  currentHumidity.textContent = `${weatherData.main.humidity}%`;
  currentWind.textContent = getWind(weatherData.wind.speed);
  currentVisibility.textContent = getVisibility(weatherData.visibility);
  feelsLike.textContent = getTemperature(weatherData.main.feels_like);

  sunriseTime.textContent = formatTime(weatherData.sys.sunrise, timezoneOffset);
  sunsetTime.textContent = formatTime(weatherData.sys.sunset, timezoneOffset);

  setDynamicBackground(weatherData.weather[0].description);
  handleWeatherAlert(weatherData);
}

function renderForecast(data) {
  forecastCards.innerHTML = "";

  const timezoneOffset = data.current.timezone;
  const dailyForecasts = getDailyForecasts(data.forecast.list);

  dailyForecasts.slice(1, 6).forEach((dayData) => {
    const item = dayData.item;

    const card = document.createElement("div");
    card.className = "forecast-card rounded-3xl p-5 text-center border border-white/15";

    card.innerHTML = `
      <h3 class="text-xl font-bold mb-3">${formatDayName(item.dt, timezoneOffset)}</h3>
      <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].description}" class="w-16 h-16 mx-auto mb-3">
      <p class="text-3xl font-extrabold text-cyan-200">${getTemperature(item.main.temp)}</p>
      <p class="text-white/80 mt-2 font-medium capitalize">${item.weather[0].description}</p>
      <div class="mt-4 text-sm text-white/70">
        <p>Humidity: ${dayData.avgHumidity}%</p>
        <p>Wind: ${getWind(dayData.maxWind)}</p>
      </div>
    `;

    forecastCards.appendChild(card);
  });
}

function renderWeatherUI(data) {
  hideEmptyState();
  hideError();
  showWeatherSections();

  renderCurrentWeather(data);
  renderForecast(data);
}
async function fetchWeatherData(url, errorMessage) {
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || errorMessage);
  }

  return data;
}
function handleWeatherSuccess(current, forecast) {
  const combinedData = { current, forecast };

  renderWeatherUI(combinedData);

  if (current && current.name) {
    saveRecentSearch(current.name);
    //showToast(`Weather loaded for ${current.name}`);
  }
}
function handleWeatherError(message) {
  hideWeatherSections();
  showEmptyState();
  showError(message);
  showToast(message);
}

     // API Calls

  async function fetchCurrentWeatherByCity(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
  return fetchWeatherData(url, "Unable to fetch current weather");
}

async function fetchForecastByCity(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
  return fetchWeatherData(url, "Unable to fetch forecast");
}

async function fetchCurrentWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  return fetchWeatherData(url, "Unable to fetch current weather");
}

async function fetchForecastByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  return fetchWeatherData(url, "Unable to fetch forecast");
} 
async function fetchWeatherByCity(city) {
  const trimmedCity = city.trim();

  if (!trimmedCity) {
    showToast("Please enter a city name");
    return;
  }

  try {
   prepareWeatherUI();
    const [current, forecast] = await Promise.all([
      fetchCurrentWeatherByCity(trimmedCity),
      fetchForecastByCity(trimmedCity)
    ]);
    handleWeatherSuccess(current, forecast);
    //showToast(`Weather loaded for ${current.name}`);
  } catch (error) {
    handleWeatherError(error.message);
  } finally {
    hideLoading();
  }
}

async function fetchWeatherByCoords(lat, lon) {
  try {
   prepareWeatherUI();
    const [current, forecast] = await Promise.all([
      fetchCurrentWeatherByCoords(lat, lon),
      fetchForecastByCoords(lat, lon)
    ]);
   handleWeatherSuccess(current, forecast);
  } catch (error) {
     handleWeatherError("Could not fetch current location weather");
  } finally {
    hideLoading();
  }
}

   //Toggle Unit

function rerenderFromStoredData() {
  if (!lastWeatherData) return;
  renderCurrentWeather(lastWeatherData);
  renderForecast(lastWeatherData);
}

toggleUnitBtn.addEventListener("click", () => {
  isCelsius = !isCelsius;
  toggleUnitBtn.textContent = isCelsius ? "°C" : "°F";
  rerenderFromStoredData();
});

function handleCitySearch() {
  fetchWeatherByCity(cityInput.value);
}

  // Event Listeners
searchBtn.addEventListener("click", handleCitySearch);

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handleCitySearch();
  }
});

currentLocationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showToast("Geolocation is not supported in your browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetchWeatherByCoords(latitude, longitude);
    },
    () => {
      showToast("Location access denied");
      showError("Unable to access your current location");
    }
  );
});

clearRecentBtn.addEventListener("click", () => {
  localStorage.removeItem("weatherRecentSearches");
  renderRecentSearches();
  showToast("Recent searches cleared");
});

/* =========================
   Initial State
========================= */

function initializeApp() {
  renderRecentSearches();
  hideLoading();
  hideError();
  hideAlert();
  hideWeatherSections();
  showEmptyState();
}

initializeApp();