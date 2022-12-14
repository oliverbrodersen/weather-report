let selectedCity = '';
let baseUrl = 'http://localhost:8080/';
async function ChangeCity(city){
    selectedCity = city;

    //Deselect
    document.getElementById("Horsens").classList.remove("selected");
    document.getElementById("Aarhus").classList.remove("selected");
    document.getElementById("Copenhagen").classList.remove("selected");

    //Select
    document.getElementById(city).classList.add("selected");
    document.getElementById("selected-city").innerHTML = city;
    document.getElementById("selected-city1").innerHTML = "<span>City: </span>" + city;

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
    await GetHistorical(city);

    //Update UI
    SetCurrent(forecasts[0]);
    SetForecast(forecasts);
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
                '<div class="precipitations">'+
                    MapPrecipitation(element.precipitation.precipitation_types) +
                '</div>' + 
                '<div class="time">'+
                    new Date(element.time).getHours() + ':0' + new Date(element.time).getMinutes() +
                '</div>'+
                '<div class="wind">'+
                    MapDirection(element.windspeed.directions) +
                 '</div>' + 
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

function Submit(){
    let _type = document.getElementById("type").value;
    let _unit = GetUnit(_type);
    let _value = parseFloat(document.getElementById("value").value);
    let _additionalData = document.getElementById("aditional-value").value;

    let today = new Date();
    today.setMinutes(0,0,0);
    let now = today.toISOString();

    let data = {};
    switch (_type)
    {
        case "temperature":
            data = {
                type: _type,
                time: now,
                place: selectedCity,
                value: _value,
                unit: _unit
            }
            break;
        case "precipitation":
            data = {
                type: _type,
                time: now,
                place: selectedCity,
                value: _value,
                unit: _unit,
                precipitation: _additionalData
            }
            break;
        case "wind speed":
            data = {
                type: _type,
                time: now,
                place: selectedCity,
                value: _value,
                unit: _unit,
                direction: _additionalData
            }
            break;
        case "cloud coverage":
            data = {
                type: _type,
                time: now,
                place: selectedCity,
                value: _value,
                unit: _unit
            }
            break;
    }

    let res = fetch(baseUrl + "data", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    console.log(res);
}

async function GetForecast(city){
    const response = await fetch(baseUrl + 'forecast/' + city, {});
    const json = await response.json();
    let forecasts = CreateForecastObjects(json);
    return forecasts;
}

async function GetHistorical(city){
    const response = await fetch(baseUrl + 'data/' + city, {});
    const json = await response.json();
    SetHistoricalData(json);
}

const type = { type: '' };

// Historical data point
const value = { value: 0 };
const HistoricalData = (data) => {
    return Object.assign({}, value, data);
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
const Historical = (temp, precipitation, wind, cloud) => {
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
const precipitation_type = { precipitation_type: '' }
const HistoricalPrecipitation = (data) => {
    return Object.assign({}, precipitation_type, data)
}

const directions = { directions: [''] }
const WindSpeed = (data) => {
    return Object.assign({}, directions, data)
}
const direction = { direction: '' }
const HistoricalWindSpeed = (data) => {
    return Object.assign({}, direction, data)
}


function SetHistoricalData(jsonData)
{
    let avgWindSpeed = 0;
    let maxTemp = 0;
    let minTemp = 999;
    let totalPrecipitation = 0;

    let today = new Date();
    let yesterday = new Date(today.getTime());
    yesterday.setDate(today.getDate() - 1);

    jsonData = jsonData.filter(x => new Date(x.time) > yesterday);
    for (let index = 0; index < jsonData.length; index++) {
        var data = jsonData[index];
        switch (data.type)
        {
            case "temperature":
                if (data.value > maxTemp)
                {
                    maxTemp = data.value;
                }
                if (data.value < minTemp)
                {
                    minTemp = data.value;
                }
                break;
            case "precipitation":
                totalPrecipitation += data.value;
                break;
            case "wind speed":
                avgWindSpeed += data.value; 
                break;
        }
    }
    avgWindSpeed /= jsonData.length;

    document.getElementById("pastMinTemp").innerHTML = minTemp + "°";
    document.getElementById("pastMaxTemp").innerHTML = maxTemp + "°";
    document.getElementById("pastPrecipitation").innerHTML = totalPrecipitation.toFixed(2) + "<span>mm</span>";
    document.getElementById("pastWindSpeed").innerHTML = avgWindSpeed.toFixed(2) + "<span>m/s</span>";
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

function ToggleAdd(){
    const addClassList = document.getElementById("add-data").classList;
    if(addClassList.contains("hide")){
        addClassList.remove("hide")
    }
    else{
        addClassList.add("hide")
    }
}

function SelectType(type){
    const av = document.getElementById("aditional-value");
    const avl = document.getElementById("aditional-value-label");
    switch(type){
        case "cloud coverage":
        case "temperature":
            av.classList.remove("show");
            avl.classList.remove("show");
            break;
        case "wind speed":
            avl.innerHTML = "Direction";
            av.classList.add("show");
            avl.classList.add("show");
            break;
        case "precipitation":
            avl.innerHTML = "Precipitation Type";
            av.classList.add("show");
            avl.classList.add("show");
            break;
    }
}

function GetUnit(type){
    switch(type){
        case "wind speed":
            return "m/s"
        case "cloud coverage":
            return "%"
        case "temperature":
            return "C";
        case "precipitation":
            return "mm";
    }
}

function MapDirection(dir){
    let res = "";
    dir.forEach(element => {
        let icon;
        switch(element){ 
            case "Southeast":
                icon = "south_east";
                break;
            case "Southwest":
                icon = "south_west";
                break;
            case "Northeast":
                icon = "north_east";
                break;
            case "Northwest":
                icon = "north_west";
                break;
            case "North":
                icon = "north";
                break;
            case "South":
                icon = "south";
                break;
            case "East":
                icon = "east";
                break;
            case "West":
                icon = "west"
                break;
        }
        res += '<span class="material-icons-round">' + icon + "</span>";
    });

    return res;
}
function MapPrecipitation(dir){
    let res = "";
    dir.forEach(element => {
        let icon;
        switch(element){ 
            case "rain":
                icon = "water_drop";
                break;
            case "sleet":
                icon = "cloud";
                break;
            case "hail":
                icon = "cloud";
                break;
            case "snow":
                icon = "ac_unit";
                break;
            default:
                icon = element;
                break;
        }
        res += '<span class="material-icons-round">' + icon + "</span>";
    });

    return res;
}

// subscribte to change in select
window.onload = function() {
    var select = document.getElementById('type');
    select.onchange = function() {
        SelectType(select.value);
    }
}

ChangeCity('Horsens');