'use strict';

var Joi = require('joi');
var request = require('request');
var Joi = require('joi');
var info =  require('./info');
var yaml = require('js-yaml');
var backand = require('@backand/nodejs-sdk');
var _ = require('lodash');
var fs = require('fs');
var util = require('util');
var config = require('./config');
var path = require('path');
var http = require('http');
var async = require('async');
var ProgressBar = require('ascii-progress');

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.commands = {
      include: {
        usage: 'Include a function from fnhub',
        lifecycleEvents: [
          'extract'
        ],
        options: {
          function: {
            usage:
              'Specify the function and version you want to deploy, version is optional '
              + '(e.g. "--function name@version" or "-f name@version")',
            required: true,
            shortcut: 'f',
          }
        },
      },
    };

    this.hooks = {
      'include:extract': this.extractFunctionSpec.bind(this),
    };
  }


  extractFunctionSpec() {
    var isValidFunction = Joi.validate(this.options.function, Joi.string().regex(/^([a-zA-Z][a-zA-Z0-9_\-]*)([0-9]+\.[0-9]+\.[0-9]+){0,1}$/).required());
    if (!isValidFunction){
      this.serverless.cli.log('Invalid module, cannot proceed, aborting!');
    }
    else {
      var functionSpec = this.options.function.split('@');
      if (functionSpec.length != 2){
        functionSpec.push('latest');
      }
      var moduleName = functionSpec[0];
      var moduleVersion = functionSpec[1];
      var that = this;
      var moduleInfo = info.getModule(moduleName, moduleVersion, function(err, moduleSpec){

        if (!err){
          // read serverless.yml file          
          try {
            var doc = yaml.safeLoad(fs.readFileSync(config.serverlessFileName, 'utf8'));
          } 
          catch (e) {
            that.serverless.cli.log('The ' + config.serverlessFileName + ' file is damaged, cannot proceed, aborting!');
            process.exit(1);
          }


          that.serverless.cli.log('We are adding the functions from the module to your serverless configuration');
          
          
          var runtime = that.serverless.service.provider.runtime;
          var url = null;
          
          async.waterfall([
            function(callbackWaterfall) {
              async.each(_.toPairs(moduleSpec.Resources), 
                function(functionSpec, callback) {

                  var key = functionSpec[0];
                  var value = functionSpec[1];

              
                  // check runtimes match
                  if (value.Properties.Runtime != runtime){
                    that.serverless.cli.log('Cannot include module ' + key + ' as its runtime does not match!');
                    callback(true);
                  }
                  else{
                    // add to serverless.yml custom section
                    var functionName = moduleName + '-' + key;
                    if (!doc.functions){
                      doc.functions = {};
                    }

                    doc.functions[functionName] = {  
                      handler: value.Properties.Handler, 
                      package: {
                        artifact: '.fnhub/' + moduleName + '.zip'
                      }
                    };

                    if (value.Properties.Environment && value.Properties.Environment.Variables){
                      doc.functions[functionName]['Environment'] = { Variables: value.Properties.Environment.Variables };
                    }

                    
                    // temporary hack to set correct storage path
                    url = value.Properties.CodeUri.replace(/fnhub.backand.io/, 's3.amazonaws.com\/fnhub.backand.io');
                    callback(null);

                  }
                },
                function(err) {
                  if (!err){
                    var schema = yaml.safeDump(doc, {});
                    try {
                      // write back module.yaml
                      fs.writeFileSync(config.serverlessFileName, schema); 
                      callbackWaterfall(null, url);     
                    }
                    catch (e) {
                      logger.error('Cannot modify the ' + config.serverlessFileName + ' file, cannot proceed, aborting'); 
                      callbackWaterfall(e);          
                    } 
                  }
                  else{
                    callbackWaterfall(err);
                  }
                }
              );
            }, 

            function(url, callbackWaterfall) {
              // download zip file into .fnhub
              var fnhubFolder = path.join(process.cwd(), config.fnhubFolder);
              var fnhubFolderExists = fs.existsSync(fnhubFolder);
              if (!fnhubFolderExists){
                fs.mkdirSync(fnhubFolder, 0o755);
              }
              that.downloadFunction(url, path.join(fnhubFolder, moduleName) + '.zip', function(err){
                if (err){
                  that.serverless.cli.log('Cannot include module ' + key + ' as its zip file is not available!');                   
                }
                callbackWaterfall(err);
              });
            }
          ], function (err, result) {

          });

            
        }
        else{
          that.serverless.cli.log('Cannot get the function definition fron fnhub, aborting!');
        }

      });



    }     
  }

  downloadFunction(url, path, callback) {
    var that = this;
    http.get(url, function(response) {
      if (response.statusCode === 200) {
        var file = fs.createWriteStream(path);
        var res = response.pipe(file);


        var len = parseInt(response.headers['content-length'], 10);

        var cur = 0;

        var bar = new ProgressBar({ 
            schema: ':bar.red :percent.green',
            total : 100
        });

        response.on("data", function(chunk) {
           
            cur += chunk.length;
            bar.tick();
        });


        res.on('finish', function(){
          callback(null);
        })
      }
      else {
        callback(response);
      }
    });  
  }




}

module.exports = ServerlessPlugin;
