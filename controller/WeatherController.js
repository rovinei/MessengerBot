var config = require("../config");
var request = require('request');
var Writter = require("../helpers/Writter");
var currentLog = new Writter("./storage/logs/test.json");
var forecastLog = new Writter("./storage/logs/forecast_weather.log");
var errorLog = new Writter("./storage/logs/error.json");


function WeatherApi(location, unit){
    var self = this;
    this.unit = unit || "metric";
    this.location = location;
}

WeatherApi.prototype.current = function (callback, unit) {

    var self = this;
    if(typeof unit !== "undefined"){
        self.unit = unit;
    }

    self.getCurrentWeatherData(self.location, self.unit).then(function(data){

        // Log data to file
        currentLog.appendFile(data, function(err){
            if(err){
                console.log("Error logging current weather data");
            }
        });

        if (callback !== undefined && callback instanceof Function) {
            callback(null, data);
        }

    }).catch(function(body){

        // Log error message to file
        errorLog.appendFile(body, function(err){
            if(err){
                console.log("Error logging error weather data"+err);
            }
        });

        if (callback instanceof Function) {
            callback(null, body);
        }
    });
}


WeatherApi.prototype.forecast = function (callback, unit) {

    var self = this;
    if(typeof unit !== "undefined"){
        self.unit = unit;
    }

    self.getForecastWeatherData(self.location, self.unit).then(function(data){

        // Log data to file
        currentLog.appendFile(data, function(err){
            if(err){
                console.log("Error logging current weather data");
            }
        });

        if (callback !== undefined && callback instanceof Function) {
            callback(null, data);
        }

    }).catch(function(body){

        // Log error message to file
        errorLog.appendFile(body, function(err){
            if(err){
                console.log("Error logging error weather data"+err);
            }
        });

        if (callback instanceof Function) {
            callback(null, body);
        }
    });
}


/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

   *************************************************************************
   ***
   *** @param int, string, array location
   *** @param string degree : enum {"degree", "kelvin", "fahrenheit"}
   *** Fetching current weather of location specify by
   *** location
   *** Return object {temp: , temp_min: , temp_max: }
   ***
   ***
   *************************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
WeatherApi.prototype.getCurrentWeatherData = function (location, unit) {

    var self = this;
    return new Promise(function(resolve, reject){
        request({
            uri: 'http://api.openweathermap.org/data/2.5/weather',
            qs: {
                q: location,
                type: "accurate",
                mode: "json",
                appid: "19a10e89ba53b1b182df45d64e7c1475",
                units: unit || "metric"
            },
            method: 'GET',

        }, function (error, response, body) {
            if (!error && (response.statusCode >= 200 && response.statusCode < 300)) {
                return resolve(body);
            } else {
                return reject(body);
            }
        });
    });
}




/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

   *********************************************************************
   ***
   *** @param int, string, array location
   *** @param string degree : enum {"degree", "kelvin", "fahrenheit"}
   *** Forecast weather of location specify by
   *** location
   *** Return object {temp: , temp_min: , temp_max: }
   ***
   ***
   *********************************************************************

*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
WeatherApi.prototype.getForecastWeatherData = function (location, unit) {
    var self = this;
    //Location can be id, city name or coordinate ([lat,lon])
    return new Promise(function(resolve, reject){
        request({
            uri: 'http://api.openweathermap.org/data/2.5/forecast',
            qs: {
                q: location,
                type: "accurate",
                mode: "json",
                appid: "19a10e89ba53b1b182df45d64e7c1475",
                units: unit || "metric"
            },
            method: 'GET',

        }, function (error, response, body) {
            if (!error && (response.statusCode >= 200 && response.statusCode < 300)) {
                return resolve(body);
            } else {
                return reject(body);
            }
        });
    });

}



module.exports = WeatherApi;
