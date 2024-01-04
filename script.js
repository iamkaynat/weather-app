const API_KEY = "fdad25b3d9cec83260f9b187cabfe796";

const DAYS_OF_THE_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getCitiesUsingGeolocation = async (searchText) => {
    const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${searchText}&appid=${API_KEY}`);
    return response.json();
}

const getCurrentWeatherData = async () => {
    const city = "Pune";
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    return response.json();
}

const getHourlyForecast = async ({ name: city }) => {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city.toLowerCase()}&appid=${API_KEY}`);

    const data = await response.json();
    console.log(data);
    return data.list.map(forecast => {
        const { main: { temp, temp_min, temp_max }, dt, dt_txt, weather: [{ description, icon }] } = forecast;
        return { temp, temp_min, temp_max, dt, dt_txt, description, icon };
    })


}
const formatTemp = (temp) => `${temp?.toFixed(1)}°`;
const createIcon = (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`



const loadCurrentForecast = ({ name, main: { temp, temp_max, temp_min }, weather: [{ description }] }) => {
    const currentForecastElement = document.querySelector("#current-forecast");
    currentForecastElement.querySelector(".city").textContent = name;
    currentForecastElement.querySelector(".temp").textContent = formatTemp(temp);
    currentForecastElement.querySelector(".description").textContent = description;
    currentForecastElement.querySelector(".minmax").textContent = `H :${formatTemp(temp_max)} L:${formatTemp(temp_min)}`;


}

const loadHourlyForecast = ({ main: { temp: tempNow }, weather: [{ icon: iconNow }] }, hourlyForecast) => {
    //console.log(hourlyForecast);
    let dataFor12Hours = hourlyForecast.slice(2, 14);
    const hourlyContainer = document.querySelector(".hourly-container");
    let innerHTMLString = `<article>

    <h2 class="time">Now</h2>
    <img class="icon" src="${createIcon(iconNow)}" alt="Icon" />
    <p class="hourly-temp">${formatTemp(tempNow)}</p>
</article>`;;
    const timeFormater = Intl.DateTimeFormat("en", {
        hour12: true, hour: "numeric"
    })
    for (let { temp, icon, dt_txt } of dataFor12Hours) {
        innerHTMLString += `<article>

                    <h2 class="time">${timeFormater.format(new Date(dt_txt))}</h2>
                    <img class="icon" src="${createIcon(icon)}" alt="Icon" />
                    <p class="hourly-temp">${formatTemp(temp)}</p>
                </article>`;

    }
    hourlyContainer.innerHTML = innerHTMLString;


}
const calculateDayWiseForecast = (hourlyForecast) => {
    let dayWiseForecast = new Map();
    for (let forecast of hourlyForecast) {
        const [date] = forecast.dt_txt.split(" ");
        const dayOfTheWeek = DAYS_OF_THE_WEEK[new Date(date).getDay()];
        if (dayWiseForecast.has(dayOfTheWeek)) {
            let ForecastForTheDay = dayWiseForecast.get(dayOfTheWeek);
            ForecastForTheDay.push(forecast);
            dayWiseForecast.set(dayOfTheWeek, ForecastForTheDay);
        }
        else {
            dayWiseForecast.set(dayOfTheWeek, [forecast]);
        }

    }
    for (let [key, value] of dayWiseForecast) {
        let temp_min = Math.min(...Array.from(value, val => val.temp_min));
        let temp_max = Math.max(...Array.from(value, val => val.temp_max));
        dayWiseForecast.set(key, { temp_min, temp_max, icon: value.find(v => v.icon).icon })
    }
    console.log(dayWiseForecast);
    return dayWiseForecast;


}

const loadFiveDayForecast = (hourlyForecast) => {
    console.log(hourlyForecast);
    const dayWiseForecast = calculateDayWiseForecast(hourlyForecast);
    const container = document.querySelector('.five-day-forecast-container');
    let dayWiseInfo = ``;
    Array.from(dayWiseForecast).map(([day, { temp_min, temp_max, icon }], index) => {
        if (index < 5) {
            dayWiseInfo += `
        <article class="day-wise-forecast">
                    <h3>${index === 0 ? "Today" : day}</h3>
                    <img class="icon" src="${createIcon(icon)}" alt="" />

                    <p class="min-temp">${formatTemp(temp_min)}</p>
                    <p class="max-temp">${formatTemp(temp_max)}</p>
                </article>
        `

        }

    })
    container.innerHTML = dayWiseInfo;

}
const loadFeelsLike = ({ main: { feels_like } }) => {
    let container = document.querySelector("#feels-like");
    container.querySelector(".feels-like-temp").textContent = formatTemp(feels_like);
}
const loadHumidity = ({ main: { humidity } }) => {
    let container = document.querySelector("#humidity");
    container.querySelector(".humidity-value").textContent = `${humidity} %`;
}
function debounce(func) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, 500
        )
    }
}

const debounceSearch = debounce((event) => {
    onSearch(event);
})

const onSearch = async (event) => {
    let { value } = event.target;
    const getCities = await getCitiesUsingGeolocation(value);

    let options = "";
    for (let { lon, lat, name, state, country } of getCities) {
        options += `<option data-city-details='${JSON.stringify({ lat, lon, name })}' value="${name} , ${state},${country}"></option>
        `
    }
    document.querySelector('#cities').innerHTML = options;
    console.log(getCities);

}

document.addEventListener("DOMContentLoaded", async () => {

    const searchInput = document.querySelector("#search");
    searchInput.addEventListener("input", debounceSearch);
    const currentWeather = await getCurrentWeatherData();
    loadCurrentForecast(currentWeather);

    const hourlyForecast = await getHourlyForecast(currentWeather);
    loadHourlyForecast(currentWeather, hourlyForecast);
    loadFiveDayForecast(hourlyForecast);
    loadFeelsLike(currentWeather);
    loadHumidity(currentWeather);

})