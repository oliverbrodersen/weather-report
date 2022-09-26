function GetForecast(){
    fetch('http://localhost:8081/forecast/Horsens')
    .then(function(response) {
        return response.json();
    }).then(function(jsonData) {
        return CreateForecastObjects(jsonData);
    }).catch(function(err) {
        console.log("Opps, Something went wrong!", err);
    })
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

// 
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
        console.log(forecast);
    }

}