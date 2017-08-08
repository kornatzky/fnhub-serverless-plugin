var request = require('request');
var async = require('async');
var config =  require('./config');
var	yaml = require('js-yaml');
var backand = require('@backand/nodejs-sdk');
backand.init(config.backand);


module.exports.getModule = getModule;

var infoLambda = {
    name:'module',
    get:'get'
}

function getModule(name, version, callback) {
    backand.fn.post(infoLambda.name, {name:name, version:version, path:infoLambda.get})
    .then(function(response){
        if (response.status == 200 && response.data)
            callback(null, response.data);
        else
            callback(response, null);
    })
    .catch(function(err){
        callback(err, null);
    });
}


