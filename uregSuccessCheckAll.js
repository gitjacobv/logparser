fs = require('fs');
async  = require('async');

var soapCount, soapSuccessCount;
var i, j, k;

var totalSoap=0;
var totalLogs=0;

//read all api.out files in current directory
var apiOutFiles = [];
var dirFiles = fs.readdirSync('.');

for(i=0; i<dirFiles.length; i++){
  if(dirFiles[i].match(/^api\.out$/) || dirFiles[i].match(/api.out.[0-9]+$/)){
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
  fs.readFile(apiOut, 'utf8', function (err,data) {
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

  console.log('\n\nUnhandled Soap Requests\n\n');

  var uerrs = Object.keys(unhandled);

  for(i=0; i<uerrs.length; i++){
   console.log(uerrs[i]);
  }

});
