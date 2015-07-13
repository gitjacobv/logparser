fs = require('fs');
fs.readFile('api.out.3', 'utf8', function (err,data) {

  if (err) {
    return console.log(err);
  }

  //Split the logs by timestamps
  var logList = data.split(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z - /g);

  var soapCount, soapSuccessCount;
  var i, j, k;

  var totalSoap =0;

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

  // var uregApiError = [
  //   "error:(\\s+)Ureg.inquirePromoRecurring:(\\s+)",
  //   "error:(\\s+)Ureg.inquirePackages:(\\s+)",
  //   "error:(\\s+)Ureg.unsubscribePackage:(\\s+)",
  //   "error:(\\s+)Ureg.register:(\\s+)"
  // ];
  //
  // var errors = [
  //   "Error:(\\s+)Unknown(\\s+)Error",
  //   "Error:(\\s+)ETIMEDOUT",
  //   "Error:(\\s+)ESOCKETTIMEDOUT",
  //   "Error:(\\s+)connect(\\s+)ECONREFUSED",
  //   "Error:(\\s+)read(\\s+)ECONNRESET",
  //   "Error:(\\s+)An(\\s+)unexpected(\\s+)InvalidXMLError(\\s+)occurred."
  // ];
  //
  // var regexErrors = [];
  // var unhandledErrors = {};
  //
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

  // for(i=0; i<regexErrors.length; i++){
  //
  //
  //   console.log(regexErrors[i].source);
  //
  //   var str = "error: Ureg.inquirePromoRecurring: Error: Unknown Error";
  //
  //
  //
  //   if(str.match(regexErrors[i])){
  //     console.log('wew');
  //     return;
  //   }
  //}


  var soapCount = Array.apply(null, Array(soapRequests.length)).map(Number.prototype.valueOf,0);
  var soapRequestCount = Array.apply(null, Array(soapRequests.length*uregApiList.length)).map(Number.prototype.valueOf,0);

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

    // if(!foundSoap){
    //   var split = logList[i].trim().split('\n', 2);
    //
    //   if(!(split[0] in unhandled) &&
    //      !split[0].match(/info:(\s+)MobilePackage.getPromos/) &&
    //      !split[0].match(/info:(\s+)MobilePackage.getSubscriptions/)
    //     ){
    //       unhandled[split[0]] = true;
    //     }
    // }

  }

  //Soap Counts
  for(i=0; i<soapRequests.length; i++){
   console.log(soapRequests[i].source.replace(/\(\\s\+\)/g  , " ").replace(/\//g, "") + ' --> ' + soapCount[i] );
  }

  console.log('\n');

  //Soap Success Request
  for(i=0; i<regexSuccess.length; i++){

   console.log(soapRequests[Math.floor(i/uregApiList.length)].source.replace(/\(\\s\+\)/g  , " ").replace(/\//g, "") + " :: " +
               regexSuccess[i].source.replace(/\//g, "") + ' --> ' + soapRequestCount[i] );
   if(i==((regexSuccess.length/2) - 1)){
     console.log('\n');
   }
  }

  console.log('\n');

  console.log('Number of timestamps: ', logList.length);
  console.log('Number of soap requests: ', totalSoap);

  console.log('\n\nUnhandled Soap Requests\n\n');

  var uerrs = Object.keys(unhandled);

  for(i=0; i<uerrs.length; i++){
   console.log(uerrs[i]);
  }

});
