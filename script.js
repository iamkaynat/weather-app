const API_KEY = "fdad25b3d9cec83260f9b187cabfe796";

const getCurrentWeatherData = async () => {
    const city = "Pune";
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    return response.json();
}

const getHourlyForecast = async ({ name: city }) => {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city.toLowerCase()}&appid=${API_KEY}`);

    const data = await response.json();
    console.log(data);


}
const formatTemp = (temp) => `${temp?.toFixed(1)}°`;



const loadCurrentForecast = ({ name, main: { temp, temp_max, temp_min }, weather: [{ description }] }) => {
    const currentForecastElement = document.querySelector("#current-forecast");
    currentForecastElement.querySelector(".city").textContent = name;
    currentForecastElement.querySelector(".temp").textContent = formatTemp(temp);
    currentForecastElement.querySelector(".description").textContent = description;
    currentForecastElement.querySelector(".minmax").textContent = `H :${formatTemp(temp_max)} L:${formatTemp(temp_min)}`;


}


document.addEventListener("DOMContentLoaded", async () => {
    const currentWeather = await getCurrentWeatherData();
    loadCurrentForecast(currentWeather);
    getHourlyForecast(currentWeather);

});