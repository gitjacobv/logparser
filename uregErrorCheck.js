fs = require('fs');

//put file here
var filename = 'api.err';

fs.readFile(filename, 'utf8', function (err,data) {

  if (err) {
    return console.log(err);
  }

  var dates = data.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/g);
  var startDate = new Date(dates[0]);
  var endDate = new Date(dates[dates.length-1]);
  console.log(startDate.toLocaleDateString() + ' to ' + endDate.toLocaleDateString());


  //Split the logs by timestamps
  var logList = data.split(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z - /g);

  var uregErrorCount = 0;
  var i, j;

  var uregApiError = [
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
  var unhandledErrors = {};

  for(i=0; i<uregApiError.length; i++){
    for(j=0; j<errors.length; j++){
      regexErrors.push(new RegExp(uregApiError[i] + errors[j]));
    }
  }

  var errCount = Array.apply(null, Array(regexErrors.length)).map(Number.prototype.valueOf,0);

  for(i=0; i<logList.length; i++){

    var found = undefined;
    for(j=0; j<regexErrors.length; j++){
      if(!found){

        found = logList[i].match(regexErrors[j]);

        if(found){
          errCount[j]++;
          break;
        }
      }
    }

    if(found){
      uregErrorCount++;
    }
    //printing unhandlded errors
    // else{
    //
    //    var split = logList[i].trim().split('\n', 2);
    //
    //    if(!(split[0] in unhandledErrors)){
    //      unhandledErrors[split[0]] = true;
    //     }
    // }

  }

   for(i=0; i<regexErrors.length; i++){
     console.log(regexErrors[i].source.replace(/\(\\s\+\)/g  , " ").replace(/\//g, "") + ' --> ' + errCount[i] );
     if( ((i+1) % uregApiError.length) == 0 ){
       console.log('\n');
     }
   }


   console.log('Number of timestamps: ', logList.length);
   console.log('Number of ureg errors: ', uregErrorCount);

   console.log('\n\nUnhandled Errors \n\n');

   var uerrs = Object.keys(unhandledErrors);

   for(i=0; i<uerrs.length; i++){
     console.log(uerrs[i]);
   }

});
