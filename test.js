var _ = require('lodash');
var _array = require('lodash/array');
var _object = require('lodash/fp/object');
var Weather = require('./controller/WeatherController');
var fs = require('fs');
var obj;

if(fs.existsSync('./storage/logs/test.json')){
    fs.readFile('./storage/logs/test.json', handleFile);
}else{
    var weather = new Weather("Phnom Penh");
    weather.current(function(err, data){
        obj = JSON.parse(data);
        console.log("API JSON: "+ obj.name);
    });
}

function handleFile(err, data){
    if(err){
        console.log(err);
    }

    obj = JSON.parse(data);
    console.log("JSON FILE: "+ obj.main.temp);
}




