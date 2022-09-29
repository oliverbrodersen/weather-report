let history;

async function ChangeCity(city){
    //Deselect
    document.getElementById("Horsens").classList.remove("selected");
    document.getElementById("Aarhus").classList.remove("selected");
    document.getElementById("Copenhagen").classList.remove("selected");

    //Select
    document.getElementById(city).classList.add("selected");
    document.getElementById("selected-city").innerHTML = city;
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); 
    var tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    var dd1 = String(tomorrow.getDate()).padStart(2, '0');
    var mm1 = String(tomorrow.getMonth() + 1).padStart(2, '0'); 
    document.getElementById("date-range").innerHTML = dd + '/' + mm + ' - ' + dd1 + '/' + mm1;

    //Get data
    const forecasts = await GetForecast(city);
    history = await GetHistorical(city);
    
    //Update UI
    SetCurrent(forecasts[0]);
    SetForecast(forecasts);
    SetHistory();
}

function SetCurrent(data){
    document.getElementById("current-time").innerHTML = new Date(data.time).getHours() + ':0' + new Date(data.time).getMinutes() + '<span class="material-icons-round">schedule</span>';
    document.getElementById("current-temp").innerHTML = data.temp.from + "°";
    document.getElementById("current-precipitation").innerHTML = data.precipitation.from + " - " + data.precipitation.from + "<span>mm</span>";
    document.getElementById("current-wind-speed").innerHTML = data.windspeed.from + " - " + data.windspeed.from + "<span>m/s</span>";
    document.getElementById("current-cloud-coverage").innerHTML = data.cloud.from + " - " + data.cloud.from + "<span>%</span>";
}

function SetForecast(data){
    const container = document.getElementById("forecast-list");
    container.innerHTML = "";
    data.forEach(element => {
        container.innerHTML +=
            '<div class="list-item">'+
                '<div class="time">'+
                    new Date(element.time).getHours() + ':0' + new Date(element.time).getMinutes() +
                '</div>'+
                '<div class="temperature-measurement">'+
                    '<span class="material-icons-round">'+
                        'thermostat'+
                    '</span>'+
                    '<p>'+
                        element.temp.from + '° - ' + element.temp.to + '°'+
                    '</p>'+
                '</div>'+
                '<div class="precipitation">'+
                    '<span class="material-icons-round">'+
                        'water_drop'+
                    '</span>'+
                    '<p>'+
                        element.precipitation.from + ' - ' + element.precipitation.to +
                        '<span>'+
                            'mm'+
                        '</span>'+
                    '</p>'+
                '</div>'+
                '<div class="wind-speed">'+
                    '<span class="material-icons-round">'+
                        'air'+
                    '</span>'+
                    '<p>'+
                        element.windspeed.from + ' - ' + element.windspeed.to +
                        '<span>'+
                            'm/s'+
                        '</span>'+
                    '</p>'+
                '</div>'+
                '<div class="cloud-coverage">'+
                    '<span class="material-icons-round">'+
                        'cloud'+
                    '</span>'+
                   ' <p>'+
                        element.cloud.from + ' - ' + element.cloud.to +
                        '<span>'+
                            '%'+
                        '</span>'+
                    '</p>'+
                '</div>'+
            '</div>';
            });
}

function SetHistory(){
    document.getElementById("pastMinTemp").innerHTML = GetMinTemp() + "°";
    document.getElementById("pastMaxTemp").innerHTML = GetMaxTemp() + "°";
    document.getElementById("pastPrecipitation").innerHTML = GetTotalPercipitation() + "<span>mm</span>";
    document.getElementById("pastWindSpeed").innerHTML = GetAvgWindSpeed() + "<span>m/s</span>";
}

function GetMinTemp(){
    return "x";
}

function GetMaxTemp(){
    return "x";
}

function GetTotalPercipitation(){
    return "x";
}

function GetAvgWindSpeed(){
    return "x";
}

async function GetForecast(city){
    const response = await fetch('http://localhost:8080/forecast/' + city, {});
    const json = await response.json();
    let forecasts = CreateForecastObjects(json);
    return forecasts;
}

async function GetHistorical(city){
    const response = await fetch('http://localhost:8080/data/' + city, {});
    const json = await response.json();
    let history = null;
    return history;
}

const type = { type: '' };

// Historical data point
const value = { from: 0 };
const HistoricalData = () => {
    return Object.assign({}, value, type);
};

// Forecast data point
const from = { from: 0 };
const to = { to: 0 };
const ForecastData = (data) => {
    return Object.assign({}, from, to, data);
};

const time = { time: '' };
const Forecast = (temp, precipitation, wind, cloud) => {
    return Object.assign({}, time, temp, precipitation, wind, cloud);
};

const Temperature = (data) => {
    return Object.assign({}, data);
}

const CloudCoverage = (data) => {
    return Object.assign({}, data);
}

const precipitation_types = { precipitation_types: [''] }
const Precipitation = (data) => {
    return Object.assign({}, precipitation_types, data)
}

const directions = { directions: [''] }
const WindSpeed = (data) => {
    return Object.assign({}, directions, data)
}

function CreateForecastObjects(jsonData)
{
    let arr = [];
    for (let index = 0; index < jsonData.length; index += 4) {

        var temp = Temperature(ForecastData({
            to: jsonData[index].to,
            from: jsonData[index].from
        }));

        var precipitation = Precipitation(ForecastData({
            to: jsonData[index+1].to,
            from: jsonData[index+1].from,
            precipitation_types: jsonData[index+1].precipitation_types
        }));

        var windspeed = WindSpeed(ForecastData({
            to: jsonData[index+2].to,
            from: jsonData[index+2].from,
            directions: jsonData[index+2].directions
        }));

        var cloud = CloudCoverage(ForecastData({
            to: jsonData[index+3].to,
            from: jsonData[index+3].from
        }));

        var forecast = Forecast({
            time: jsonData[index].time,
            temp: temp,
            precipitation: precipitation,
            windspeed: windspeed,
            cloud: cloud
        });

        arr.push(forecast);
    }
    return arr;
}

ChangeCity('Horsens');