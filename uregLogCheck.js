var fs = require('fs');
var async  = require('async');
var prompt = require('prompt');
var program = require('commander');

var path;
var filename;
var mode;

async.series([
  function(cb){

    //default values
    path = './';
    filename = 'api';
    mode = 'error';
    text = 'output.txt';
    csv = 'output.csv';

    program
    .version('0.0.1')
    .usage('[options]')
    .option('-p, --path <value>', 'Path to files (default current directory)')
    .option('-f, --filename <value>', 'Filename (default api)')
    .option('-m, --mode <value>', 'Mode (default err) [error, success]')
    .option('-t, --text <value>', 'Filename for text output (default output.txt)')
    .option('-c, --csv <value>', 'Filename for csv output (default output.csv)')
    .parse(process.argv);

    if(program.path) path = program.path;
    if(program.filename) filename = program.filename;
    if(program.mode) mode = program.mode;

    if(program.text){
      if(!((typeof program.text) == 'boolean')){
        text = program.text
      }
    }

    if(program.csv){
      if(!((typeof program.csv) == 'boolean')){
        csv = program.csv;
      }
    }

    cb();
  },
  function(cb){

    if(mode == 'error'){
      var i, j;

      var uregErrorCount=0;
      var totalLogs=0;

      //read all api.out files in current directory
      var apiErrFiles = [];
      var dirFiles = fs.readdirSync(path);

      for(i=0; i<dirFiles.length; i++){

        var outRegex1 = new RegExp("^" + filename + "\.err$");
        var outRegex2 = new RegExp("^" + filename + "\.err\.[0-9]+$");

        if(dirFiles[i].match(outRegex1) || dirFiles[i].match(outRegex2)){
          apiErrFiles.push(dirFiles[i]);
        }
      }

      var uregApi = [
        "error:(\\s+)Ureg.inquirePromoRecurring:(\\s+)",
        "error:(\\s+)Ureg.inquirePackages:(\\s+)",
        "error:(\\s+)Ureg.unsubscribePackage:(\\s+)",
        "error:(\\s+)Ureg.register:(\\s+)"
      ];

      var errors = [
        "Error:(\\s+)Unknown(\\s+)Error",
        "Error:(\\s+)ETIMEDOUT",
        "Error:(\\s+)ESOCKETTIMEDOUT",
        "Error:(\\s+)connect(\\s+)ECONREFUSED",
        "Error:(\\s+)read(\\s+)ECONNRESET",
        "Error:(\\s+)An(\\s+)unexpected(\\s+)InvalidXMLError(\\s+)occurred."
      ];

      var regexErrors = [];
      var unhandled = {};

      for(i=0; i<uregApi.length; i++){
        for(j=0; j<errors.length; j++){
          regexErrors.push(new RegExp(uregApi[i] + errors[j]));
        }
      }

      var apiCount = Array.apply(null, Array(uregApi.length)).map(Number.prototype.valueOf,0);
      var uregApiErrorCount = Array.apply(null, Array(uregApi.length*errors.length)).map(Number.prototype.valueOf,0);

      async.eachSeries(apiErrFiles, function(apiErr, callback){
        fs.readFile(path + "/" + apiErr, 'utf8', function (err,data) {
          if (err) {
            return console.log(err);
          }

          var dates = data.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/g);
          var startDate = new Date(dates[0]);
          var endDate = new Date(dates[dates.length-1]);
          console.log(apiErr+' : '+startDate.toLocaleDateString() + ' to ' + endDate.toLocaleDateString());

          //Split the logs by timestamps
          var logList = data.split(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z - /g);
          totalLogs += logList.length;

          for(i=0; i<logList.length; i++){

            var foundErr = undefined;
            for(j=0; j<regexErrors.length; j++){
              if(!foundErr){

                foundErr = logList[i].match(regexErrors[j]);

                if(foundErr){
                  //Specific Error
                  uregApiErrorCount[j]++;

                  //Error under the api
                  apiCount[Math.floor(j/apiCount.length)]++;
                  break;
                }
              }
            }

            if(foundErr){
              uregErrorCount++;
            }
            //printing unhandlded errors
            // else{
            //
            //    var split = logList[i].trim().split('\n', 2);
            //
            //    if(!(split[0] in unhandled)){
            //      unhandled[split[0]] = true;
            //     }
            // }

          }
          callback();
        });
      }, function done(){

        console.log('\n');

        console.log('Total Ureg.inquirePromoRecurring --> ' + apiCount[0]);
        console.log('Total Ureg.inquirePackages --> ' + apiCount[1]);
        console.log('Total Ureg.unsubscribePackage --> ' + apiCount[2]);
        console.log('Total Ureg.register --> ' + apiCount[3]);

        console.log('\n');

        for(i=0; i<regexErrors.length; i++){
          console.log(regexErrors[i].source.replace(/\(\\s\+\)/g  , " ").replace(/\//g, "") + ' --> ' + uregApiErrorCount[i] );
          if( ((i+1) % errors.length) == 0 ){
            console.log('\n');
          }
        }

        console.log('Number of log entries: ', totalLogs);
        console.log('Number of ureg errors: ', uregErrorCount);

        console.log('\nUnhandled Errors Requests\n');

        var uerrs = Object.keys(unhandled);

        for(i=0; i<uerrs.length; i++){
         console.log(uerrs[i]);
        }

        if(text){
          var textStream = fs.createWriteStream(text);
          textStream.once('open', function(fd) {

            textStream.write('Total Ureg.inquirePromoRecurring --> ' + apiCount[0] + '\n');
            textStream.write('Total Ureg.inquirePackages --> ' + apiCount[1] + '\n');
            textStream.write('Total Ureg.unsubscribePackage --> ' + apiCount[2]  + '\n');
            textStream.write('Total Ureg.register --> ' + apiCount[3]  + '\n');

            textStream.write('\n');

            for(i=0; i<regexErrors.length; i++){

              textStream.write(regexErrors[i].source.substring(11, regexErrors[i].source.length).replace(/\(\\s\+\)/g  , " ").replace(/\//g, "") + ' --> ' + uregApiErrorCount[i] + '\n');
              if( ((i+1) % errors.length) == 0 ){
                textStream.write('\n');
              }
            }

            textStream.write('Number of log entries: ' + totalLogs + '\n');
            textStream.write('Number of ureg errors: ' + uregErrorCount + '\n');

            textStream.write('\nUnhandled Errors Requests\n');
            for(i=0; i<uerrs.length; i++){
             textStream.write(uerrs[i] + '\n');
            }
            textStream.end();
          });
        }

        if(csv){
          var csvStream = fs.createWriteStream(csv);
          csvStream.once('open', function(fd) {

            csvStream.write('Total Ureg.inquirePromoRecurring , ' + apiCount[0] + '\n');
            csvStream.write('Total Ureg.inquirePackages , ' + apiCount[1] + '\n');
            csvStream.write('Total Ureg.unsubscribePackage , ' + apiCount[2]  + '\n');
            csvStream.write('Total Ureg.register , ' + apiCount[3]  + '\n');

            csvStream.write('\n');

            for(i=0; i<regexErrors.length; i++){

              csvStream.write(regexErrors[i].source.substring(11, regexErrors[i].source.length).replace(/\(\\s\+\)/g  , " ").replace(/\//g, "") + ' , ' + uregApiErrorCount[i] + '\n');
              if( ((i+1) % errors.length) == 0 ){
                csvStream.write('\n');
              }
            }

            csvStream.write('Number of log entries , ' + totalLogs + '\n');
            csvStream.write('Number of ureg errors , ' + uregErrorCount + '\n');
            csvStream.end();
          });
        }

        cb();

      });
    }

    else if(mode == 'success'){

      var soapCount, soapSuccessCount;
      var i, j, k;

      var totalSoap=0;
      var totalLogs=0;

      //read all api.out files in current directory
      var apiOutFiles = [];
      var dirFiles = fs.readdirSync(path);

      for(i=0; i<dirFiles.length; i++){

        var outRegex1 = new RegExp("^" + filename + "\.out$");
        var outRegex2 = new RegExp("^" + filename + "\.out\.[0-9]+$");

        if(dirFiles[i].match(outRegex1) || dirFiles[i].match(outRegex2)){
          apiOutFiles.push(dirFiles[i]);
        }
      }

      var soapRequests = [
        /info:(\s+)Soap.request:(\s+)res/,
        /info:(\s+)Soap.request:(\s+)req/,
      ];

      var uregApiList = [
        "inquirePromoRecurring",
        "inquirePackages",
        "unsubscribePackage",
        "register",
        "undefined",
        "Failed to process response headers",
        "Failed to establish a backside connection"
      ];

      var regexSuccess = [];
      var unhandled = {};

      for(i=0; i<soapRequests.length; i++){
        for(j=0; j<uregApiList.length; j++){

          if(i==0 && j<4){
            regexSuccess.push(new RegExp(uregApiList[j] + "Response" ));
          }
          else{
            regexSuccess.push(new RegExp(uregApiList[j]));
          }
        }
      }

      var soapCount = Array.apply(null, Array(soapRequests.length)).map(Number.prototype.valueOf,0);
      var soapRequestCount = Array.apply(null, Array(soapRequests.length*uregApiList.length)).map(Number.prototype.valueOf,0);

      async.eachSeries(apiOutFiles, function(apiOut, callback){
        fs.readFile(path + "/" + apiOut, 'utf8', function (err,data) {
          if (err) {
            return console.log(err);
          }

          var dates = data.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/g);
          var startDate = new Date(dates[0]);
          var endDate = new Date(dates[dates.length-1]);
          console.log(apiOut+' : '+startDate.toLocaleDateString() + ' to ' + endDate.toLocaleDateString());

          //Split the logs by timestamps
          var logList = data.split(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z - /g);
          totalLogs += logList.length;

          for(i=0; i<logList.length; i++){
            var foundSoap = undefined;
            for(j=0; j<soapRequests.length; j++){
              if(!foundSoap){

                foundSoap = logList[i].match(soapRequests[j]);

                if(foundSoap){
                  soapCount[j]++;

                  var foundSoapRequest = undefined;

                  for(k=0; k<uregApiList.length; k++){

                    if(!foundSoapRequest){

                      foundSoapRequest = logList[i].match(regexSuccess[(j*uregApiList.length) + k]);

                    }

                    if(foundSoapRequest){
                      soapRequestCount[(j*uregApiList.length) + k]++;
                      break;
                    }

                  }

                  if(!foundSoapRequest){
                    unhandled[logList[i]] = true;
                  }

                  break;
                }
              }
            }

            if(foundSoap){
              totalSoap++;
            }
          }
            callback();
        });

      }, function done(){

        //Soap Counts
        // for(i=0; i<soapRequests.length; i++){
        //  console.log(soapRequests[i].source.replace(/\(\\s\+\)/g  , " ").replace(/\//g, "") + ' --> ' + soapCount[i] );
        // }

        console.log('\n');

        console.log('Total Responses --> ' + soapCount[0]);
        console.log('Total Request --> ' + soapCount[1]);

        console.log('\n');

        //Soap Success Request
        for(i=0; i<regexSuccess.length; i++){


          if(i<(regexSuccess.length)/2){
            console.log('Response : ' + regexSuccess[i].source.replace(/\//g, "") + ' --> ' + soapRequestCount[i]);
          } else{
            console.log('Request : ' + regexSuccess[i].source.replace(/\//g, "") + ' --> ' + soapRequestCount[i]);
          }

          if(i==((regexSuccess.length/soapRequests.length) - 1)){
            console.log('\n');
          }
        }

        console.log('\n');

        console.log('Number of log entries: ', totalLogs);
        console.log('Number of soap requests: ', totalSoap);

        console.log('\nUnhandled Soap Requests\n');

        var uerrs = Object.keys(unhandled);

        for(i=0; i<uerrs.length; i++){
         console.log(uerrs[i]);
        }

        if(text){
          var textStream = fs.createWriteStream(text);
          textStream.once('open', function(fd) {

            textStream.write('Total Responses --> ' + soapCount[0] + '\n');
            textStream.write('Total Request --> ' + soapCount[1] + '\n');

            textStream.write('\n');

            //Soap Success Request
            for(i=0; i<regexSuccess.length; i++){

              if(i<(regexSuccess.length)/2){
                textStream.write('Response : ' + regexSuccess[i].source.replace(/\//g, "") + ' --> ' + soapRequestCount[i] + '\n');
              } else{
                textStream.write('Request : ' + regexSuccess[i].source.replace(/\//g, "") + ' --> ' + soapRequestCount[i] + '\n');
              }

              if(i==((regexSuccess.length/soapRequests.length) - 1)){
                textStream.write('\n');
              }
            }

            textStream.write('\n');

            textStream.write('Number of log entries: ' + totalLogs + '\n');
            textStream.write('Number of soap requests: ' + totalSoap + '\n');

            textStream.write('\nUnhandled Soap Requests\n');

            var uerrs = Object.keys(unhandled);

            for(i=0; i<uerrs.length; i++){
              textStream.write(uerrs[i] + '\n');
            }

            textStream.end();
          });
        }


        if(csv){
          var csvStream = fs.createWriteStream(csv);
          csvStream.once('open', function(fd) {

            csvStream.write('Total Responses , ' + soapCount[0] + '\n');
            csvStream.write('Total Request , ' + soapCount[1] + '\n');

            csvStream.write('\n');

            //Soap Success Request
            for(i=0; i<regexSuccess.length; i++){

              if(i<(regexSuccess.length)/2){
                csvStream.write('Response : ' + regexSuccess[i].source.replace(/\//g, "") + ' , ' + soapRequestCount[i] + '\n');
              } else{
                csvStream.write('Request : ' + regexSuccess[i].source.replace(/\//g, "") + ' , ' + soapRequestCount[i] + '\n');
              }

              if(i==((regexSuccess.length/soapRequests.length) - 1)){
                csvStream.write('\n');
              }
            }

            csvStream.write('\n');

            csvStream.write('Number of log entries , ' + totalLogs + '\n');
            csvStream.write('Number of soap requests , ' + totalSoap + '\n');

            csvStream.end();
          });
        }

        cb();

      });
    }

    else{
      console.log("Undefined mode: " + mode);
    }
  }
]);
